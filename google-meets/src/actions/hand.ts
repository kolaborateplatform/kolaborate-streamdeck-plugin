import { JsonObject, SingletonAction, WillAppearEvent, KeyUpEvent, action } from "@elgato/streamdeck";

interface HandSettings extends JsonObject {
    isHandRaised: boolean;
}

@action({ UUID: "com.kolaborate.google-meets.hand" })
export class HandAction extends SingletonAction<HandSettings> {
    private isHandRaised = false;

    override async onWillAppear(ev: WillAppearEvent<HandSettings>): Promise<void> {
        try {
            const settings = ev.payload.settings;
            if (settings?.isHandRaised !== undefined) {
                this.isHandRaised = settings.isHandRaised;
            }
            await this.updateVisuals(ev);
        } catch (error) {
            console.error("Error in onWillAppear:", error);
            await ev.action.showAlert();
        }
    }

    override async onKeyUp(ev: KeyUpEvent<HandSettings>): Promise<void> {
        try {
            // Toggle hand state
            this.isHandRaised = !this.isHandRaised;
            
            // TODO: Implement actual Google Meet hand raise control
            // This will require browser interaction via content scripts
            
            // Save the new state
            await ev.action.setSettings({ isHandRaised: this.isHandRaised });
            
            // Update the button visuals
            await this.updateVisuals(ev);
            await ev.action.showOk();
        } catch (error) {
            console.error("Error in onKeyUp:", error);
            await ev.action.showAlert();
        }
    }

    private async updateVisuals(ev: WillAppearEvent<HandSettings> | KeyUpEvent<HandSettings>): Promise<void> {
        const state = this.isHandRaised ? 1 : 0;
        await ev.action.setImage(`images/hand_${state}.png`);
        await ev.action.setTitle(this.isHandRaised ? "Lower Hand" : "Raise Hand");
    }
} 