import {
  ConflictException,
  UnauthorizedException,
  UseFilters,
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
import { JwtPayload } from '../auth/interfaces/jwt-payload';
import { PreSignalDto } from './dto/pre-signal.dto';
import { SignalDto } from './dto/signal.dto';
import { GatewayExceptionFilter } from './exceptions/gateway-exception.filter';
import { AuthenticatedWebSocket } from './interfaces/authenticated-web-socket';
import { PreSignalMessage } from './messages/pre-signal.message';
import { SignalMessage } from './messages/signal.message';

@WebSocketGateway()
@UseFilters(new GatewayExceptionFilter())
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ConversationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  sockets = new Map<string, WebSocket>();
  constructor(private jwt: JwtService) {}

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
    console.log(
      `sending to: ${(this.sockets.get(data.recipientId) as any)?.id}`,
    );
    const message: PreSignalMessage = {
      event,
      data: {
        type: data.type,
        sender: { id: client.id, username: client.username },
      },
    };
    this.sockets.get(data.recipientId)?.send(JSON.stringify(message));
  }

  rejectConnection(client: WebSocket) {
    const rejectionResponse = JSON.stringify(
      new UnauthorizedException().getResponse(),
    );
    client.send(rejectionResponse);
    client.terminate();
  }

  handleConnection(client: WebSocket, request: IncomingMessage) {
    const accessToken = new URLSearchParams(request.url?.substring(1)).get(
      'access_token',
    );
    let tokenPayload = null;

    // Reject connections that do not have a valid access token
    try {
      tokenPayload = this.jwt.verify(accessToken ?? '') as JwtPayload;
      if (!tokenPayload) {
        this.rejectConnection(client);
        return;
      }
    } catch {
      this.rejectConnection(client);
      return;
    }
    // Reject connections from accounts that are already connected
    if (this.sockets.has(tokenPayload.sub)) {
      client.send(JSON.stringify(new ConflictException().getResponse()));
      client.terminate();
      return;
    }
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
