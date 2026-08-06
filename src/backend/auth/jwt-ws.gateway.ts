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
import { Socket, Server } from 'socket.io';
import { JwtPayload } from './auth.service';
import { GraphService } from '../graph/graph.service';

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
    const character = turnData.character;

    if (!turnId || !playerAction || !character) {
      throw new WsException('Missing required fields: turnId, playerAction, character');
    }

    // TODO(T14b): get chronicleId from user context (current active chronicle)
    const chronicleId = turnData.chronicleId as string || 'placeholder-chronicle-id';

    // Run the turn through GraphService
    const result = await this.graphService.runTurn({
      turnId,
      userId: user.sub,
      chronicleId,
      playerAction,
      character,
      lastReferenceUrl: turnData.lastReferenceUrl as string | undefined,
    });

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
