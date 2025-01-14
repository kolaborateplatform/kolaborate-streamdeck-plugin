import type { WebSocketMessage, MeetAction } from '../types';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;
  private readonly port = 12345; // Should match Stream Deck plugin's port

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(`ws://localhost:${this.port}`);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.handleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = this.handleMessage.bind(this);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      if (message.type === 'MEET_ACTION' && message.action) {
        this.handleMeetAction(message.action);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private async handleMeetAction(action: MeetAction): Promise<void> {
    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'EXECUTE_ACTION', action });
      }
    } catch (error) {
      console.error('Error sending action to content script:', error);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  public sendStateUpdate(state: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: 'STATE_UPDATE',
        data: state
      };
      this.ws.send(JSON.stringify(message));
    }
  }
}
