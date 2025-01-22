import { JsonObject, SingletonAction, WillAppearEvent, KeyUpEvent, action } from "@elgato/streamdeck";

interface MicrophoneSettings extends JsonObject {
  isMuted: boolean;
}

@action({ UUID: "com.kolaborate.google-meets.microphone" })
export class MicrophoneAction extends SingletonAction<MicrophoneSettings> {
  private isMuted = false;

  override async onWillAppear(ev: WillAppearEvent<MicrophoneSettings>): Promise<void> {
    try {
      // Load saved settings if they exist
      const settings = ev.payload.settings;
      if (settings?.isMuted !== undefined) {
        this.isMuted = settings.isMuted;
      }
      await this.updateVisuals(ev);
    } catch (error) {
      console.error("Error in onWillAppear:", error);
      await ev.action.showAlert();
    }
  }

  override async onKeyUp(ev: KeyUpEvent<MicrophoneSettings>): Promise<void> {
    try {
      // Toggle mute state
      this.isMuted = !this.isMuted;
      
      // TODO: Implement actual Google Meet microphone control
      // This will require browser interaction via content scripts
      
      // Save the new state
      await ev.action.setSettings({ isMuted: this.isMuted });
      
      // Update the button visuals
      await this.updateVisuals(ev);
      await ev.action.showOk();
    } catch (error) {
      console.error("Error in onKeyUp:", error);
      await ev.action.showAlert();
    }
  }

  private async updateVisuals(ev: WillAppearEvent<MicrophoneSettings> | KeyUpEvent<MicrophoneSettings>): Promise<void> {
    const state = this.isMuted ? 0 : 1;
    await ev.action.setImage(`images/microphone_${state}.png`);
    await ev.action.setTitle(this.isMuted ? "Unmute" : "Mute");
  }
} 