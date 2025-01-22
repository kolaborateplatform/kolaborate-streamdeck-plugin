import { JsonObject, SingletonAction, WillAppearEvent, KeyUpEvent, action } from "@elgato/streamdeck";

interface CameraSettings extends JsonObject {
    isVideoOff: boolean;
}

@action({ UUID: "com.kolaborate.google-meets.camera" })
export class CameraAction extends SingletonAction<CameraSettings> {
    private isVideoOff = false;

    override async onWillAppear(ev: WillAppearEvent<CameraSettings>): Promise<void> {
        try {
            const settings = ev.payload.settings;
            if (settings?.isVideoOff !== undefined) {
                this.isVideoOff = settings.isVideoOff;
            }
            await this.updateVisuals(ev);
        } catch (error) {
            console.error("Error in onWillAppear:", error);
            await ev.action.showAlert();
        }
    }

    override async onKeyUp(ev: KeyUpEvent<CameraSettings>): Promise<void> {
        try {
            // Toggle camera state
            this.isVideoOff = !this.isVideoOff;
            
            // TODO: Implement actual Google Meet camera control
            // This will require browser interaction via content scripts
            
            // Save the new state
            await ev.action.setSettings({ isVideoOff: this.isVideoOff });
            
            // Update the button visuals
            await this.updateVisuals(ev);
            await ev.action.showOk();
        } catch (error) {
            console.error("Error in onKeyUp:", error);
            await ev.action.showAlert();
        }
    }

    private async updateVisuals(ev: WillAppearEvent<CameraSettings> | KeyUpEvent<CameraSettings>): Promise<void> {
        const state = this.isVideoOff ? 0 : 1;
        await ev.action.setImage(`images/camera_${state}.png`);
        await ev.action.setTitle(this.isVideoOff ? "Turn On Camera" : "Turn Off Camera");
    }
} 