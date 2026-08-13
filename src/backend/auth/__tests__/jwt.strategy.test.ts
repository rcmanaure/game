import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { JwtStrategy } from '../jwt.strategy';
import { UserEntity } from '../../entities/user.entity';
import { UserRole } from '../roles.guard';

describe('JwtStrategy', () => {
  const config = { getOrThrow: () => 'test-secret' } as unknown as ConfigService;

  function makeStrategy(userRepo: Partial<Repository<UserEntity>>) {
    return new JwtStrategy(config, userRepo as Repository<UserEntity>);
  }

  it('hydrates role from the DB, not from the JWT claim', async () => {
    const findOne = jest.fn().mockResolvedValue({ id: 'u1', email: 'a@b.com', role: UserRole.Admin });
    const strategy = makeStrategy({ findOne });

    // Payload never carries a role — proves the guard can't be fed a forged one via the token.
    const result = await strategy.validate({ sub: 'u1', email: 'a@b.com' });

    expect(findOne).toHaveBeenCalledWith({ where: { id: 'u1' } });
    expect(result.role).toBe(UserRole.Admin);
  });

  it('rejects tokens for users deleted after the token was issued', async () => {
    const findOne = jest.fn().mockResolvedValue(null);
    const strategy = makeStrategy({ findOne });

    await expect(strategy.validate({ sub: 'gone', email: 'a@b.com' })).rejects.toThrow(UnauthorizedException);
  });

  it('rejects payloads missing sub or email before touching the DB', async () => {
    const findOne = jest.fn();
    const strategy = makeStrategy({ findOne });

    await expect(strategy.validate({ sub: '', email: 'a@b.com' })).rejects.toThrow(UnauthorizedException);
    expect(findOne).not.toHaveBeenCalled();
  });
});
