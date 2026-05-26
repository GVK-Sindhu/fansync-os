import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Logger } from './logger';

export class WebSocketService {
  private static wss: WebSocketServer | null = null;

  public static init(server: HttpServer) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket) => {
      Logger.info('WebSocket', 'Client connected.');

      // Send initial welcome pulse
      ws.send(JSON.stringify({ event: 'system:ready', data: { status: 'online' } }));

      ws.on('close', () => {
        Logger.info('WebSocket', 'Client disconnected.');
      });

      ws.on('error', (err) => {
        Logger.error('WebSocket', 'Client connection error', err);
      });
    });

    Logger.info('WebSocket', 'WebSocket Server initialized.');
  }

  public static broadcast(event: string, data: any) {
    if (!this.wss) {
      Logger.warn('WebSocket', 'Attempted to broadcast before server initialization.');
      return;
    }

    const payload = JSON.stringify({ event, data });
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });

    Logger.debug('WebSocket', `Broadcasted event: ${event}`);
  }
}
