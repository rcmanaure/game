import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // user_id
  email: string;
  iat?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
    };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
    );
    return this.jwtService.sign(
      { sub: userId },
      {
        secret: refreshSecret,
        expiresIn: '7d',
      },
    );
  }

  async validateRefreshToken(token: string): Promise<JwtPayload | null> {
    try {
      const refreshSecret = this.configService.get<string>(
        'JWT_REFRESH_SECRET',
      );
      const payload = await this.jwtService.verifyAsync(token, {
        secret: refreshSecret,
      });
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }
}
