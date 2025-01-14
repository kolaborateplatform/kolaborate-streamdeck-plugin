// WebSocket message types
export type MeetAction = 'MUTE' | 'UNMUTE' | 'VIDEO_ON' | 'VIDEO_OFF' | 'RAISE_HAND' | 'LOWER_HAND' | 'LEAVE';

export interface WebSocketMessage {
  type: 'MEET_ACTION' | 'STATE_UPDATE';
  action?: MeetAction;
  data?: any;
}

// Google Meet control types
export interface MeetControls {
  toggleMute: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleHand: () => Promise<void>;
  leaveMeeting: () => Promise<void>;
  getMeetingState: () => Promise<MeetingState>;
}

export interface MeetingState {
  isMuted: boolean;
  isVideoOn: boolean;
  isHandRaised: boolean;
  inMeeting: boolean;
}

// Chrome extension message types
export interface ExtensionMessage {
  type: 'GET_MEET_STATE' | 'EXECUTE_ACTION';
  action?: MeetAction;
}
