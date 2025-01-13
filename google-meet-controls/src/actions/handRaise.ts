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

interface HandRaiseSettings extends JsonObject {
  isHandRaised: boolean;
}

@action({ UUID: "com.kolaborate.googlemeet.handRaise" })
export class HandRaiseAction extends SingletonAction<HandRaiseSettings> {
  private wsManager: WebSocketManager;
  private encryptionService: EncryptionService;
  private currentAction: KeyAction<HandRaiseSettings> | null = null;

  constructor(wsManager: WebSocketManager, encryptionService: EncryptionService) {
    super();
    this.wsManager = wsManager;
    this.encryptionService = encryptionService;
    
    this.wsManager.on('handStateChanged', (data) => {
      if (this.currentAction) {
        this.updateState(this.currentAction, data.isHandRaised);
      }
    });
  }

  override async onKeyDown(ev: KeyDownEvent<HandRaiseSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    
    const settings = ev.payload.settings;
    const newState = !settings.isHandRaised;
    
    const message: Message = {
      type: 'action',
      action: 'toggleHand',
      data: { isHandRaised: newState }
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'toggleHand',
      data: encryptedMessage
    });
  }

  override async onWillAppear(ev: WillAppearEvent<HandRaiseSettings>): Promise<void> {
    if (!ev.action.isKey()) return;
    this.currentAction = ev.action;
    
    await ev.action.setSettings({ isHandRaised: false });
    
    const message: Message = {
      type: 'action',
      action: 'getHandState',
      data: null
    };

    const encryptedMessage = this.encryptionService.encrypt(message);
    this.wsManager.sendMessage({
      type: 'encrypted',
      action: 'getHandState',
      data: encryptedMessage
    });
  }

  private async updateState(action: KeyAction<HandRaiseSettings>, isHandRaised: boolean): Promise<void> {
    await action.setSettings({ isHandRaised });
    
    const imagePath = isHandRaised ? 'images/hand-up.png' : 'images/hand-down.png';
    await action.setImage(imagePath);
  }
} 