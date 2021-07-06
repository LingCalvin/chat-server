import { JwtPayload } from './jwt-payload';

export interface OneTimeJwtPayload extends JwtPayload {
  type: 'one-time';
}
