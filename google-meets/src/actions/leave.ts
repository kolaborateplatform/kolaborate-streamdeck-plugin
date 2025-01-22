import { JsonObject, SingletonAction, WillAppearEvent, KeyUpEvent, action } from "@elgato/streamdeck";

interface LeaveSettings extends JsonObject {
    // No settings needed for leave action
}

@action({ UUID: "com.kolaborate.google-meets.leave" })
export class LeaveAction extends SingletonAction<LeaveSettings> {
    override async onWillAppear(ev: WillAppearEvent<LeaveSettings>): Promise<void> {
        try {
            await this.updateVisuals(ev);
        } catch (error) {
            console.error("Error in onWillAppear:", error);
            await ev.action.showAlert();
        }
    }

    override async onKeyUp(ev: KeyUpEvent<LeaveSettings>): Promise<void> {
        try {
            // TODO: Implement actual Google Meet leave meeting control
            // This will require browser interaction via content scripts
            
            await ev.action.showOk();
        } catch (error) {
            console.error("Error in onKeyUp:", error);
            await ev.action.showAlert();
        }
    }

    private async updateVisuals(ev: WillAppearEvent<LeaveSettings> | KeyUpEvent<LeaveSettings>): Promise<void> {
        await ev.action.setImage('images/leave.png');
        await ev.action.setTitle('Leave Meeting');
    }
} 