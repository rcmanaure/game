import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard, UserRole } from '../roles.guard';

function ctxWithUser(user: unknown, requiredRoles: UserRole[] | undefined): { ctx: ExecutionContext; guard: RolesGuard } {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
  const ctx = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
  return { ctx, guard: new RolesGuard(reflector) };
}

describe('RolesGuard', () => {
  it('allows any request when no @Roles metadata is set', () => {
    const { ctx, guard } = ctxWithUser(undefined, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when roles are required but user.role is undefined (fail closed, not default-allow)', () => {
    const { ctx, guard } = ctxWithUser({ sub: 'u1', email: 'a@b.com' }, [UserRole.Admin]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('denies when there is no user on the request at all', () => {
    const { ctx, guard } = ctxWithUser(undefined, [UserRole.User]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('allows when the hydrated role is in the required set', () => {
    const { ctx, guard } = ctxWithUser({ role: UserRole.Admin }, [UserRole.Admin]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('denies when the hydrated role is not in the required set', () => {
    const { ctx, guard } = ctxWithUser({ role: UserRole.User }, [UserRole.Admin]);
    expect(guard.canActivate(ctx)).toBe(false);
  });
});
