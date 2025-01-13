import streamdeck, {
  action,
  KeyAction,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  JsonObject
} from "@elgato/streamdeck";
import { WebSocketManager, Message } from '../core/websocket-manager';
import { EncryptionService } from '../core/encryption';

interface LeaveSettings extends JsonObject {
  // Add any settings if needed
}

@action({ UUID: "com.kolaborate.googlemeet.leave" })
export class LeaveAction extends SingletonAction<LeaveSettings> {
  private wsManager: WebSocketManager;
  private encryptionService: EncryptionService;
  private currentAction: KeyAction<LeaveSettings> | null = null;

  constructor(wsManager: WebSocketManager, encryptionService: EncryptionService) {
    super();
    this.wsManager = wsManager;
    this.encryptionService = encryptionService;
  }

  override async onKeyDown(ev: KeyDownEvent<LeaveSettings>): Promise<void> {
    if (!ev.action.isKey()) return;

    const message: Message = {
      type: 'action',
      action: 'leaveMeeting',
      data: null
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'leaveMeeting',
      data: encryptedMessage
    });
  }

  override async onWillAppear(ev: WillAppearEvent<LeaveSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    this.currentAction = ev.action;
    await ev.action.setImage('images/leave.png');
  }
} 