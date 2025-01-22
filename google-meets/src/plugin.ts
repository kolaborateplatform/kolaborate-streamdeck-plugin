import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { MicrophoneAction } from "./actions/microphone";
import { CameraAction } from "./actions/camera";
import { HandAction } from "./actions/hand";
import { LeaveAction } from "./actions/leave";

// Enable trace logging for development
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions
streamDeck.actions.registerAction(new MicrophoneAction());
streamDeck.actions.registerAction(new CameraAction());
streamDeck.actions.registerAction(new HandAction());
streamDeck.actions.registerAction(new LeaveAction());

// Connect to Stream Deck
streamDeck.connect();
