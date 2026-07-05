import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
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
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly authService: AuthService) {}

  // Runs once after the server is initialized — reject unauthenticated
  // connections at the handshake level (before the client sees "connect").
  afterInit(server: Server) {
    server.use((socket, next) => {
      const auth = socket.handshake.auth as Record<string, unknown> | undefined;
      const token = typeof auth?.token === 'string' ? auth.token : undefined;

      if (!token) {
        next(new Error('Authentication error: No token provided'));
        return;
      }

      this.authService
        .validateToken(token)
        .then((payload) => {
          socket.data.user = payload;
          next();
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Invalid token';
          next(new Error(`Authentication error: ${msg}`));
        });
    });
  }

  handleConnection(client: Socket) {
    console.log(`[WebSocket] Client authenticated & connected: ${client.id}`);
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
