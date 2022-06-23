import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import logger from '../utils/logger';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    logger.debug('Init');
  }

  handleConnection(client: Socket, ...args: any[]) {
    logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    logger.debug(`Client disconnected: ${client.id}`);
  }

  sendResult(result: string[][]): void {
    this.server.emit('result', result);
  }
}
