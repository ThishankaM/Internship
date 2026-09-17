import type { Request } from 'express';

export type UserRole = 'USER' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};
