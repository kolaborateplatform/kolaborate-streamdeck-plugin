import streamdeck, {
  Action,
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
  JsonObject,
  KeyAction
} from "@elgato/streamdeck";
import { WebSocketManager, Message } from '../core/websocket-manager';
import { EncryptionService } from '../core/encryption';

interface MuteSettings extends JsonObject {
  isMuted: boolean;
}

@action({ UUID: "com.kolaborate.googlemeet.mute" })
export class MuteAction extends SingletonAction<MuteSettings> {
  private wsManager: WebSocketManager;
  private encryptionService: EncryptionService;
  private currentAction: KeyAction<MuteSettings> | null = null;

  constructor(wsManager: WebSocketManager, encryptionService: EncryptionService) {
    super();
    this.wsManager = wsManager;
    this.encryptionService = encryptionService;
    
    this.wsManager.on('muteStateChanged', (data) => {
      if (this.currentAction) {
        this.updateState(this.currentAction, data.isMuted);
      }
    });
  }

  override async onWillAppear(ev: WillAppearEvent<MuteSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    this.currentAction = ev.action;
    
    // Initialize with default state
    const settings = { isMuted: false };
    await ev.action.setSettings(settings);
    
    // Request current state from Google Meet
    const message = {
      type: 'action',
      action: 'getMuteState',
      data: null
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'getMuteState',
      data: encryptedMessage
    });
  }

  override async onKeyDown(ev: KeyDownEvent<MuteSettings>): Promise<void> {
    if (!ev.action.isKey()) return;

    const settings = ev.payload.settings;
    const newState = !settings.isMuted;
    
    const message = {
      type: 'action',
      action: 'toggleMute',
      data: { isMuted: newState }
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'toggleMute',
      data: encryptedMessage
    });
  }

  private async updateState(action: KeyAction<MuteSettings>, isMuted: boolean): Promise<void> {
    await action.setSettings({ isMuted });
    const imagePath = isMuted ? 'images/muted.png' : 'images/unmuted.png';
    await action.setImage(imagePath);
  }
} 