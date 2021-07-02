import { User } from '@prisma/client';

export class SignInResponse {
  accessToken: string;
  user: Omit<User, 'password' | 'lastLogin'>;
}
