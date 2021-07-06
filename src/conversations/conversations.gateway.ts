import {
  ConflictException,
  UnauthorizedException,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { IncomingMessage } from 'http';
import WebSocket from 'ws';
import { WsGuard } from '../auth/guards/ws.guard';
import { PreSignalDto } from './dto/pre-signal.dto';
import { SignalDto } from './dto/signal.dto';
import { GatewayExceptionFilter } from './exceptions/gateway-exception.filter';
import { AuthenticatedWebSocket } from '../auth/interfaces/authenticated-web-socket';
import { PreSignalMessage } from './messages/pre-signal.message';
import { SignalMessage } from './messages/signal.message';
import { AuthService } from '../auth/auth.service';
import { OneTimeJwtPayload } from '../auth/interfaces/one-time-jwt-payload';

@WebSocketGateway()
@UseGuards(WsGuard)
@UseFilters(new GatewayExceptionFilter())
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  sockets = new Map<string, WebSocket>();
  constructor(private auth: AuthService, private jwt: JwtService) {}

  @SubscribeMessage('signal')
  handleSignal(
    @ConnectedSocket() client: AuthenticatedWebSocket,
    @MessageBody() { recipientId, signalData }: SignalDto,
  ) {
    const event = 'signal';
    const receivingSocket = this.sockets.get(recipientId);

    const message: SignalMessage = {
      event,
      data: {
        sender: { id: client.id, username: client.username },
        signalData,
      },
    };

    receivingSocket?.send(JSON.stringify(message));
  }

  @SubscribeMessage('pre-signal')
  async handleAdd(
    @ConnectedSocket() client: AuthenticatedWebSocket,
    @MessageBody() data: PreSignalDto,
  ) {
    const event = 'pre-signal';
    const message: PreSignalMessage = {
      event,
      data: {
        type: data.type,
        sender: { id: client.id, username: client.username },
      },
    };
    this.sockets.get(data.recipientId)?.send(JSON.stringify(message));
  }

  @SubscribeMessage('ping')
  handlePing() {
    return { event: 'ping', data: 'pong' };
  }

  rejectConnection(client: WebSocket, message?: string) {
    const rejectionResponse = JSON.stringify(
      new UnauthorizedException(message).getResponse(),
    );
    client.send(rejectionResponse);
    client.terminate();
  }

  async handleConnection(client: WebSocket, request: IncomingMessage) {
    const ticket = new URL(
      request.url ?? '',
      `http://${request.headers.host}`,
    ).searchParams.get('ticket');

    if (!ticket) {
      this.rejectConnection(client, 'A ticket must be provided.');
      return;
    }

    let tokenPayload: OneTimeJwtPayload | null = null;

    // Reject connections that do not have a valid access token
    try {
      tokenPayload = this.jwt.verify<OneTimeJwtPayload>(ticket);
    } catch {
      this.rejectConnection(client, 'Invalid ticket.');
      return;
    }

    // Reject connections from accounts that are already connected
    if (this.sockets.has(tokenPayload.sub)) {
      client.send(JSON.stringify(new ConflictException().getResponse()));
      client.terminate();
      return;
    }

    // Check that the token is a single-use token and that it has not been
    // revoked
    if (
      tokenPayload.type !== 'one-time' ||
      !(await this.auth.validateToken(ticket))
    ) {
      this.rejectConnection(client, 'Invalid ticket.');
      return;
    }

    // Revoke the token to prevent it from being used again
    await this.auth.revokeToken(
      tokenPayload.jti,
      new Date(tokenPayload.exp * 1000),
    );

    // Add authentication information to the socket
    (client as WebSocket & { id?: string }).id = tokenPayload.sub;
    (client as WebSocket & { username?: string }).username =
      tokenPayload.username;

    // Add the socket to the list of active sockets
    this.sockets.set(tokenPayload.sub, client);
  }

  handleDisconnect(client: WebSocket & { id?: string }) {
    if (client.id !== undefined) {
      // Remove the socket from the list of active sockets
      this.sockets.delete(client.id);
    }
  }
}
