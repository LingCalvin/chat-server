import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { PossiblyAuthenticatedWebSocket } from '../interfaces/possibly-authenticated-websocket';

@Injectable()
export class JwtWsGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: PossiblyAuthenticatedWebSocket = context
      .switchToWs()
      .getClient();
    try {
      this.jwt.verify(client.accessToken ?? '');
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
