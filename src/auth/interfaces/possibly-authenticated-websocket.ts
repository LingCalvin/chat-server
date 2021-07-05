import WebSocket from 'ws';
import { AuthenticatedWebSocket } from './authenticated-web-socket';

export interface PossiblyAuthenticatedWebSocket extends WebSocket {
  id: AuthenticatedWebSocket['id'] | undefined;
  username: AuthenticatedWebSocket['username'] | undefined;
  accessToken: AuthenticatedWebSocket['accessToken'] | undefined;
}
