import { WebSocketManager } from '../utils/websocket';
import type { ExtensionMessage, MeetingState } from '../types';

class BackgroundService {
  private wsManager: WebSocketManager;
  private meetState: MeetingState = {
    isMuted: false,
    isVideoOn: true,
    isHandRaised: false,
    inMeeting: false
  };

  constructor() {
    this.wsManager = new WebSocketManager();
    this.setupMessageListeners();
  }

  private setupMessageListeners(): void {
    chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
      if (message.type === 'GET_MEET_STATE') {
        sendResponse(this.meetState);
      } else if (sender.tab?.id && message.type === 'STATE_UPDATE') {
        this.meetState = message.data;
        this.wsManager.sendStateUpdate(this.meetState);
      }
      return true;
    });
  }

  private async getCurrentTab(): Promise<chrome.tabs.Tab | undefined> {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }
}

// Initialize the background service
new BackgroundService();
