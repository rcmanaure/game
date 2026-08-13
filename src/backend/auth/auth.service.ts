import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { ChronicleEntity } from '../entities/chronicle.entity';
import { hashPassword, verifyPassword } from './password.util';

export interface JwtPayload {
  sub: string; // user_id
  email: string;
  iat?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(ChronicleEntity) private chronicleRepo: Repository<ChronicleEntity>,
  ) {}

  // Creates the user, opens their first chronicle, and stamps it as active
  // — closes the 'placeholder-chronicle-id' gap (jwt-ws.gateway.ts) for
  // every user who registers through this path.
  async register(email: string, password: string): Promise<AuthTokens> {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.userRepo.save(
      this.userRepo.create({ email, passwordHash: hashPassword(password) }),
    );
    const chronicle = await this.chronicleRepo.save(
      this.chronicleRepo.create({ userId: user.id }),
    );
    user.activeChronicleId = chronicle.id;
    await this.userRepo.save(user);

    return this.issueTokens(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueTokens(user);
  }

  private async issueTokens(user: UserEntity): Promise<AuthTokens> {
    return {
      accessToken: await this.generateAccessToken(user.id, user.email),
      refreshToken: await this.generateRefreshToken(user.id),
    };
  }

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
