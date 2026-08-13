import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../entities/user.entity';
import { ChronicleEntity } from '../../entities/chronicle.entity';
import { hashPassword } from '../password.util';

// Real JwtService (via JwtModule.register) rather than a mock — signing
// and verifying a real token is cheap and confirms the actual integration
// works, not just that a mock was called correctly.
describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let chronicleRepo: { create: jest.Mock; save: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'user-1', ...data })),
    };
    chronicleRepo = {
      create: jest.fn((data) => data),
      save: jest.fn(async (data) => ({ id: 'chronicle-1', ...data })),
    };

    const module = await Test.createTestingModule({
      imports: [
        JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '15m' } }),
      ],
      providers: [
        AuthService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('test-refresh-secret') } },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(ChronicleEntity), useValue: chronicleRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates a user, opens a chronicle, stamps activeChronicleId, and returns tokens', async () => {
      userRepo.findOne.mockResolvedValueOnce(null); // no existing user with this email

      const tokens = await service.register('new@example.com', 'password1234');

      expect(userRepo.save).toHaveBeenNthCalledWith(1, expect.objectContaining({ email: 'new@example.com' }));
      expect(chronicleRepo.save).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
      // Second save is the activeChronicleId stamp — the fix that closes
      // the 'placeholder-chronicle-id' gap for every user who registers.
      expect(userRepo.save).toHaveBeenNthCalledWith(2, expect.objectContaining({ activeChronicleId: 'chronicle-1' }));
      expect(tokens.accessToken).toEqual(expect.any(String));
      expect(tokens.refreshToken).toEqual(expect.any(String));
    });

    it('never persists the plaintext password', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      await service.register('new@example.com', 'my-real-password');

      const savedUser = userRepo.save.mock.calls[0][0];
      expect(savedUser.passwordHash).not.toEqual('my-real-password');
      expect(savedUser).not.toHaveProperty('password');
    });

    it('rejects a duplicate email with ConflictException, before ever touching the chronicle repo', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 'existing-user', email: 'taken@example.com' });

      await expect(service.register('taken@example.com', 'password1234')).rejects.toThrow(ConflictException);
      expect(chronicleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns tokens for the correct password', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: hashPassword('correct-password'),
      });

      const tokens = await service.login('user@example.com', 'correct-password');
      expect(tokens.accessToken).toEqual(expect.any(String));
      expect(tokens.refreshToken).toEqual(expect.any(String));
    });

    it('rejects the wrong password with UnauthorizedException', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        passwordHash: hashPassword('correct-password'),
      });

      await expect(service.login('user@example.com', 'wrong-password')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects a nonexistent email with the SAME error as a wrong password — no user-enumeration signal', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.login('nobody@example.com', 'anything')).rejects.toThrow(UnauthorizedException);
    });
  });
});
