import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import type { AuthenticatedRequest } from './authenticated-request.js';

describe('RolesGuard', () => {
  const createContext = (user?: AuthenticatedRequest['user']) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    }) as unknown as ExecutionContext;

  it('allows access when no roles are required', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(createContext())).toBe(true);
  });

  it('allows an admin to access an admin-only route', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(
        createContext({
          id: 'user-1',
          name: 'Admin',
          email: 'admin@example.com',
          role: 'ADMIN',
        }),
      ),
    ).toBe(true);
  });

  it('denies a normal user from an admin-only route', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(
        createContext({
          id: 'user-1',
          name: 'User',
          email: 'user@example.com',
          role: 'USER',
        }),
      ),
    ).toBe(false);
  });
});
