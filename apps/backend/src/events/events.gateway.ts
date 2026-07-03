import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to FRONTEND_URL
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService) {}

  handleConnection(client: Socket) {
    const auth = client.handshake.auth as Record<string, unknown> | undefined;
    const token = typeof auth?.token === 'string' ? auth.token : undefined;

    if (!token) {
      console.log(
        `[WebSocket] Connection rejected: No token provided (Client: ${client.id})`,
      );
      client.disconnect(true);
      return;
    }

    try {
      this.authService.validateToken(token);
      console.log(`[WebSocket] Client authenticated & connected: ${client.id}`);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error ? err.message : 'Unknown validation error';
      console.log(
        `[WebSocket] Connection rejected: Invalid token. Error: ${errMsg} (Client: ${client.id})`,
      );
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
  }

  /**
   * Broadcasts an event to all connected WebSocket clients.
   */
  broadcast(event: string, payload: unknown) {
    if (this.server) {
      this.server.emit(event, payload);
    }
  }
}
