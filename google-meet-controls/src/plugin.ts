import streamdeck, { LogLevel } from "@elgato/streamdeck";
import { WebSocketManager } from './core/websocket-manager';
import { EncryptionService } from './core/encryption';
import { MuteAction } from './actions/mute';
import { VideoAction } from './actions/video';
import { HandRaiseAction } from './actions/handRaise';
import { LeaveAction } from './actions/leave';

// Initialize services
const wsManager = new WebSocketManager();
const encryptionService = new EncryptionService();

// Set logging level
streamdeck.logger.setLevel(LogLevel.TRACE);

// Register all actions
streamdeck.actions.registerAction(new MuteAction(wsManager, encryptionService));
streamdeck.actions.registerAction(new VideoAction(wsManager, encryptionService));
streamdeck.actions.registerAction(new HandRaiseAction(wsManager, encryptionService));
streamdeck.actions.registerAction(new LeaveAction(wsManager, encryptionService));

// Connect to Stream Deck
streamdeck.connect();