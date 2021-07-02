import WebSocket from 'ws';

export interface AuthenticatedWebSocket extends WebSocket {
  id: string;
  username: string;
}
