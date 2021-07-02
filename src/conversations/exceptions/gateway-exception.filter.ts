import {
  ArgumentsHost,
  Catch,
  HttpException,
  WsExceptionFilter,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import WebSocket from 'ws';

@Catch(WsException, HttpException)
export class GatewayExceptionFilter
  implements WsExceptionFilter<WsException | HttpException>
{
  catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  handleError(client: WebSocket, exception: WsException | HttpException) {
    if (exception instanceof HttpException) {
      client.send(JSON.stringify(exception.getResponse()));
    } else {
      client.send(JSON.stringify(exception.getError()));
    }
  }
}
