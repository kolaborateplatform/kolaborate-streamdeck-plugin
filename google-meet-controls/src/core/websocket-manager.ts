import WebSocket from 'ws';
import { EncryptionService } from './encryption';

export interface Message {
  type: string;
  action: string;
  data?: any;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private readonly port = 12345;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {}

  public connect(): void {
    try {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);
      
      this.ws.on('open', () => {
        console.log('Connected to Chrome extension');
        this.reconnectAttempts = 0;
      });

      this.ws.on('message', (data: string) => {
        try {
          const message: Message = JSON.parse(data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      });

      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, 2000 * this.reconnectAttempts);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public sendMessage(message: Message): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  private handleMessage(message: Message): void {
    const callbacks = this.listeners.get(message.type);
    if (callbacks) {
      callbacks.forEach(callback => callback(message.data));
    }
  }
} 