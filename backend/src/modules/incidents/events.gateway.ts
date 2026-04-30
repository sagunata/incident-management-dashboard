import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`İstemci (Frontend) bağlandı: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`İstemci (Frontend) ayrıldı: ${client.id}`);
  }

  emitIncidentCreated(incident: any) {
    this.server.emit('incidentCreated', incident);
  }

  emitIncidentUpdated(incident: any) {
    this.server.emit('incidentUpdated', incident);
  }

  emitIncidentDeleted(id: string) {
    this.server.emit('incidentDeleted', { id });
  }
}