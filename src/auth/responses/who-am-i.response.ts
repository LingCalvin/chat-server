import { JwtPayload } from '../interfaces/jwt-payload';

export class WhoAmIResponse implements JwtPayload {
  exp: number;
  jti: string;
  sub: string;
  username: string;
}
