// Selectors for Google Meet controls
const SELECTORS = {
  MUTE_BUTTON: '[role="button"][aria-label*="microphone"]',
  VIDEO_BUTTON: '[role="button"][aria-label*="camera"]',
  HAND_BUTTON: '[role="button"][aria-label*="Raise hand"]',
  LEAVE_BUTTON: '[role="button"][aria-label*="Leave call"]'
};

// State tracking
let state = {
  isMuted: false,
  isVideoOff: false,
  isHandRaised: false
};

// Helper function to click a button
function clickButton(selector) {
  const button = document.querySelector(selector);
  if (button) {
    button.click();
    return true;
  }
  return false;
}

// Helper function to get button state
function getButtonState(selector, stateIndicator) {
  const button = document.querySelector(selector);
  if (button) {
    const ariaLabel = button.getAttribute('aria-label') || '';
    return ariaLabel.toLowerCase().includes(stateIndicator);
  }
  return false;
}

// Update state and notify Stream Deck
function updateState(newState) {
  state = { ...state, ...newState };
  chrome.runtime.sendMessage({
    type: 'stateUpdate',
    data: state
  });
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message) => {
  if (!message.action) return;

  switch (message.action) {
    case 'toggleMute':
      if (clickButton(SELECTORS.MUTE_BUTTON)) {
        const isMuted = getButtonState(SELECTORS.MUTE_BUTTON, 'unmute');
        updateState({ isMuted });
      }
      break;

    case 'toggleVideo':
      if (clickButton(SELECTORS.VIDEO_BUTTON)) {
        const isVideoOff = getButtonState(SELECTORS.VIDEO_BUTTON, 'turn on');
        updateState({ isVideoOff });
      }
      break;

    case 'toggleHand':
      if (clickButton(SELECTORS.HAND_BUTTON)) {
        const isHandRaised = getButtonState(SELECTORS.HAND_BUTTON, 'lower');
        updateState({ isHandRaised });
      }
      break;

    case 'leaveMeeting':
      clickButton(SELECTORS.LEAVE_BUTTON);
      break;

    case 'getMuteState':
      const isMuted = getButtonState(SELECTORS.MUTE_BUTTON, 'unmute');
      updateState({ isMuted });
      break;

    case 'getVideoState':
      const isVideoOff = getButtonState(SELECTORS.VIDEO_BUTTON, 'turn on');
      updateState({ isVideoOff });
      break;

    case 'getHandState':
      const isHandRaised = getButtonState(SELECTORS.HAND_BUTTON, 'lower');
      updateState({ isHandRaised });
      break;
  }
});

// Monitor DOM changes for control state changes
const observer = new MutationObserver(() => {
  const newState = {
    isMuted: getButtonState(SELECTORS.MUTE_BUTTON, 'unmute'),
    isVideoOff: getButtonState(SELECTORS.VIDEO_BUTTON, 'turn on'),
    isHandRaised: getButtonState(SELECTORS.HAND_BUTTON, 'lower')
  };

  if (JSON.stringify(newState) !== JSON.stringify(state)) {
    updateState(newState);
  }
});

// Start observing once Google Meet controls are loaded
function startObserving() {
  const controls = document.querySelector('[role="complementary"]');
  if (controls) {
    observer.observe(controls, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-label']
    });
    
    // Get initial state
    updateState({
      isMuted: getButtonState(SELECTORS.MUTE_BUTTON, 'unmute'),
      isVideoOff: getButtonState(SELECTORS.VIDEO_BUTTON, 'turn on'),
      isHandRaised: getButtonState(SELECTORS.HAND_BUTTON, 'lower')
    });
  } else {
    setTimeout(startObserving, 1000);
  }
}

// Start monitoring when the page loads
startObserving(); 