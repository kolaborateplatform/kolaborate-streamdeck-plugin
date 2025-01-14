import type { MeetControls, MeetingState } from '../types';

export class GoogleMeetControls implements MeetControls {
  private readonly selectors = {
    muteButton: '[role="button"][aria-label*="microphone"]',
    videoButton: '[role="button"][aria-label*="camera"]',
    handButton: '[role="button"][aria-label*="hand"]',
    leaveButton: '[role="button"][aria-label*="leave"]',
  };

  async toggleMute(): Promise<void> {
    const muteButton = document.querySelector<HTMLButtonElement>(this.selectors.muteButton);
    if (muteButton) {
      muteButton.click();
    }
  }

  async toggleVideo(): Promise<void> {
    const videoButton = document.querySelector<HTMLButtonElement>(this.selectors.videoButton);
    if (videoButton) {
      videoButton.click();
    }
  }

  async toggleHand(): Promise<void> {
    const handButton = document.querySelector<HTMLButtonElement>(this.selectors.handButton);
    if (handButton) {
      handButton.click();
    }
  }

  async leaveMeeting(): Promise<void> {
    const leaveButton = document.querySelector<HTMLButtonElement>(this.selectors.leaveButton);
    if (leaveButton) {
      leaveButton.click();
    }
  }

  async getMeetingState(): Promise<MeetingState> {
    const muteButton = document.querySelector<HTMLButtonElement>(this.selectors.muteButton);
    const videoButton = document.querySelector<HTMLButtonElement>(this.selectors.videoButton);
    const handButton = document.querySelector<HTMLButtonElement>(this.selectors.handButton);

    return {
      isMuted: muteButton?.getAttribute('aria-label')?.includes('unmute') ?? false,
      isVideoOn: !videoButton?.getAttribute('aria-label')?.includes('turn on') ?? true,
      isHandRaised: handButton?.getAttribute('aria-pressed') === 'true' ?? false,
      inMeeting: Boolean(document.querySelector(this.selectors.leaveButton))
    };
  }

  private waitForElement(selector: string): Promise<Element | null> {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 10000);
    });
  }
}
