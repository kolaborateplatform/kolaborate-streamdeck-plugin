import { SingletonAction, JsonObject } from "@elgato/streamdeck";
import { WebSocketManager } from "../core/websocket-manager";

interface BaseSettings extends JsonObject {
  // Add any common settings here if needed
}

export class GoogleMeetAction extends SingletonAction<BaseSettings> {
  protected wsManager: WebSocketManager;

  constructor(wsManager: WebSocketManager) {
    super();
    this.wsManager = wsManager;
  }

  protected sendToChrome(action: string, data: unknown = null): void {
    this.wsManager.sendMessage({
      type: 'action',
      action,
      data
    });
  }
} 