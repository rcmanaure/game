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
import { TurnEntity } from '../entities/turn.entity';
import { GraphService } from '../graph/graph.service';
import { CharacterSchema } from '../../harness/character';

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
    @InjectRepository(TurnEntity)
    private turnRepo: Repository<TurnEntity>,
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
    const playerAction = turnData.playerAction as string;

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

    // Get chronicleId: prefer client-provided, fallback to user's activeChronicleId, then placeholder
    let chronicleId = turnData.chronicleId as string;
    if (!chronicleId) {
      try {
        const userRecord = await this.userRepo.findOne({ where: { id: user.sub } });
        chronicleId = userRecord?.activeChronicleId || 'placeholder-chronicle-id';
      } catch (err) {
        this.logger.error(`Failed to fetch user ${user.sub}: ${(err as Error).message}`);
        chronicleId = 'placeholder-chronicle-id';
      }
    }

    // Calculate turnNumber: count existing completed/reserved turns for this chronicle
    let turnNumber = 1;
    try {
      const existingTurns = await this.turnRepo.count({
        where: { chronicleId },
      });
      turnNumber = existingTurns + 1;
    } catch (err) {
      this.logger.warn(`Failed to count turns for chronicle ${chronicleId}, using turnNumber=1: ${(err as Error).message}`);
    }

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
        turnNumber,
      },
      (artUrl: string) => {
        client.emit('art:ready', { turnId, url: artUrl });
      }
    );

    if (!result.success) {
      client.emit('turn:error', { turnId, error: result.error });
      return;
    }

    client.emit('turn:complete', { turnId });
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
