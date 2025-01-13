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

interface VideoSettings extends JsonObject {
  isVideoOff: boolean;
}

@action({ UUID: "com.kolaborate.googlemeet.video" })
export class VideoAction extends SingletonAction<VideoSettings> {
  private wsManager: WebSocketManager;
  private encryptionService: EncryptionService;
  private currentAction: KeyAction<VideoSettings> | null = null;

  constructor(wsManager: WebSocketManager, encryptionService: EncryptionService) {
    super();
    this.wsManager = wsManager;
    this.encryptionService = encryptionService;
    
    this.wsManager.on('videoStateChanged', (data) => {
      if (this.currentAction) {
        this.updateState(this.currentAction, data.isVideoOff);
      }
    });
  }

  override async onKeyDown(ev: KeyDownEvent<VideoSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    
    const settings = ev.payload.settings;
    const newState = !settings.isVideoOff;
    
    const message: Message = {
      type: 'action',
      action: 'toggleVideo',
      data: { isVideoOff: newState }
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'toggleVideo',
      data: encryptedMessage
    });
  }

  override async onWillAppear(ev: WillAppearEvent<VideoSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    this.currentAction = ev.action;
    
    await ev.action.setSettings({ isVideoOff: false });
    
    const message: Message = {
      type: 'action',
      action: 'getVideoState',
      data: null
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'getVideoState',
      data: encryptedMessage
    });
  }

  private async updateState(action: KeyAction<VideoSettings>, isVideoOff: boolean): Promise<void> {
    await action.setSettings({ isVideoOff });
    
    const imagePath = isVideoOff ? 'images/video-off.png' : 'images/video-on.png';
    await action.setImage(imagePath);
  }
} 