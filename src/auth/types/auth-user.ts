import { Request } from 'express';
import { UserRole } from '../../users/user.entity';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type AuthRequest = Request & { user?: AuthUser };
