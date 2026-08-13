import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket, Server } from 'socket.io';
import { JwtPayload } from './auth.service';
import { UserEntity } from '../entities/user.entity';
import { ChronicleEntity } from '../entities/chronicle.entity';
import { GraphService } from '../graph/graph.service';
import { CharacterSchema } from '../../harness/character';
import { sanitizePlayerAction } from '../../harness/sanitize';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3001';
      if (!origin || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
  },
})
@Injectable()
export class JwtWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private logger = new Logger(JwtWsGateway.name);
  private authenticatedSockets = new Map<string, JwtPayload>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private graphService: GraphService,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(ChronicleEntity)
    private chronicleRepo: Repository<ChronicleEntity>,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      const secret = this.configService.get<string>('JWT_SECRET');
      const payload = await this.jwtService.verifyAsync(token, { secret });

      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Store authenticated user context
      this.authenticatedSockets.set(client.id, payload);
      client.data.user = payload;

      this.logger.debug(`Client ${client.id} authenticated as ${payload.email}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Connection rejected: ${errorMsg}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    this.authenticatedSockets.delete(client.id);
    this.logger.debug(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('turn')
  async handleTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ): Promise<void> {
    const user = client.data.user as JwtPayload;
    if (!user) {
      throw new WsException('Unauthorized');
    }

    // Parse turn request
    const turnData = data as Record<string, unknown>;
    const turnId = turnData.turnId as string;
    // M2.7: sanitize at the trust boundary, before this text goes anywhere
    // near an LLM prompt — length cap + control-char strip. Everything
    // downstream (persistence, runTurn, the prompt itself) uses this
    // sanitized value, not the raw one.
    const playerAction = sanitizePlayerAction((turnData.playerAction as string) ?? '');

    if (!turnId || !playerAction || !turnData.character) {
      throw new WsException('Missing required fields: turnId, playerAction, character');
    }

    // Validate character state — never trust client-supplied values
    let character;
    try {
      character = CharacterSchema.parse(turnData.character);
    } catch (error) {
      throw new WsException(`Invalid character state: ${(error as Error).message}`);
    }

    // Get chronicleId: prefer client-provided, fallback to user's activeChronicleId.
    // A client-supplied chronicleId is NEVER trusted as-is — it's verified
    // against this user's own chronicles below, closing the cross-user turn
    // insertion gap (a client could otherwise target another user's
    // chronicleId and have countTurns/recall read across accounts).
    let chronicleId = turnData.chronicleId as string | undefined;
    if (!chronicleId) {
      try {
        const userRecord = await this.userRepo.findOne({ where: { id: user.sub } });
        chronicleId = userRecord?.activeChronicleId;
      } catch (err) {
        this.logger.error(`Failed to fetch user ${user.sub}: ${(err as Error).message}`);
      }
    }

    if (!chronicleId) {
      throw new WsException('No active chronicle for this user');
    }

    const chronicle = await this.chronicleRepo.findOne({
      where: { id: chronicleId, userId: user.sub },
    });
    if (!chronicle) {
      throw new WsException('chronicleId does not belong to this user');
    }

    // turnNumber is no longer computed here. Counting before the reservation
    // was check-then-act: two concurrent turns both read N and both sent N+1.
    // GraphService counts after its own reservation commits instead.

    // Run the turn through GraphService
    // Pass callback for async art generation completion
    const result = await this.graphService.runTurn(
      {
        turnId,
        userId: user.sub,
        chronicleId,
        playerAction,
        character,
        lastReferenceUrl: turnData.lastReferenceUrl as string | undefined,
      },
      (artUrl: string) => {
        client.emit('art:ready', { turnId, url: artUrl });
      }
    );

    if (!result.success) {
      if (result.chronicleAlreadyEnded) {
        client.emit('chronicle:ended', { turnId, error: result.error });
      } else {
        client.emit('turn:error', { turnId, error: result.error });
      }
      return;
    }

    // M2.5: the death-causing turn still completes normally (narration/art
    // for the death itself), then a separate chronicle:ended follows so
    // the client can transition without losing the final beat.
    client.emit('turn:complete', { turnId });
    if (result.chronicleJustEnded) {
      client.emit('chronicle:ended', { turnId });
    }
  }

  private extractToken(client: Socket): string | undefined {
    // Extract from auth header in handshake query
    const token =
      client.handshake.auth?.token ||
      client.handshake.query?.token;

    if (typeof token === 'string') {
      return token;
    }

    // Alternative: Bearer token in headers
    const authHeader = client.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return undefined;
  }
}
