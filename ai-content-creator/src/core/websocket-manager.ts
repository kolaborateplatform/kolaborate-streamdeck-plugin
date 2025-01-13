import WebSocket from 'ws';

export class WebSocketManager {
  private ws: WebSocket;
  private pluginUUID: string;

  constructor(port: number, pluginUUID: string, registerEvent: string, info: string) {
    this.pluginUUID = pluginUUID;
    this.ws = new WebSocket(`ws://127.0.0.1:${port}`);

    this.ws.on('open', () => {
      this.register(registerEvent, info);
    });
  }

  private register(event: string, info: string): void {
    this.ws.send(JSON.stringify({
      event: event,
      uuid: this.pluginUUID
    }));
  }

  public send(event: string, context: string, payload: any = {}): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        action: event,
        event: 'sendToPlugin',
        context: context,
        payload: payload
      }));
    }
  }

  public showAlert(context: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'showAlert',
        context: context
      }));
    }
  }

  public showOk(context: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'showOk',
        context: context
      }));
    }
  }

  public setTitle(context: string, title: string): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'setTitle',
        context: context,
        payload: {
          title: title
        }
      }));
    }
  }

  public setState(context: string, state: number): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        event: 'setState',
        context: context,
        payload: {
          state: state
        }
      }));
    }
  }

  public onMessage(callback: (message: any) => void): void {
    this.ws.on('message', (data: WebSocket.Data) => {
      const message = JSON.parse(data.toString());
      callback(message);
    });
  }
} 