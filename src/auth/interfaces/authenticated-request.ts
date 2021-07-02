import { User } from '@prisma/client';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload';

export interface AuthenticatedRequest extends Request {
  user: Request['user'] & Omit<User, 'password'> & { jwtPayload: JwtPayload };
}
