import { GoogleMeetControls } from '../utils/meet-controls';
import type { ExtensionMessage, MeetAction } from '../types';

class ContentScript {
  private meetControls: GoogleMeetControls;
  private stateUpdateInterval: number;

  constructor() {
    this.meetControls = new GoogleMeetControls();
    this.setupMessageListener();
    this.startStateUpdates();
  }

  private setupMessageListener(): void {
    chrome.runtime.onMessage.addListener(async (message: ExtensionMessage) => {
      if (message.type === 'EXECUTE_ACTION' && message.action) {
        await this.handleMeetAction(message.action);
      }
      return true;
    });
  }

  private async handleMeetAction(action: MeetAction): Promise<void> {
    switch (action) {
      case 'MUTE':
      case 'UNMUTE':
        await this.meetControls.toggleMute();
        break;
      case 'VIDEO_ON':
      case 'VIDEO_OFF':
        await this.meetControls.toggleVideo();
        break;
      case 'RAISE_HAND':
      case 'LOWER_HAND':
        await this.meetControls.toggleHand();
        break;
      case 'LEAVE':
        await this.meetControls.leaveMeeting();
        break;
    }
  }

  private startStateUpdates(): void {
    // Update state every second
    this.stateUpdateInterval = window.setInterval(async () => {
      const state = await this.meetControls.getMeetingState();
      chrome.runtime.sendMessage({ type: 'STATE_UPDATE', data: state });
    }, 1000);
  }

  public cleanup(): void {
    window.clearInterval(this.stateUpdateInterval);
  }
}

// Initialize the content script
const contentScript = new ContentScript();

// Cleanup on window unload
window.addEventListener('unload', () => {
  contentScript.cleanup();
});
