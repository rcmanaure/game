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

@WebSocketGateway({
  cors: {
    origin: '*', // Configure per environment
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
  handleTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: unknown,
  ): void {
    const user = client.data.user as JwtPayload;
    if (!user) {
      throw new WsException('Unauthorized');
    }

    // Route to turn handler
    this.logger.debug(`Turn received from ${user.email}`);
    // TODO: Emit to narration listener after LLM processes
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
