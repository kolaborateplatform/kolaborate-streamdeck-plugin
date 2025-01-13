// Google Meet control selectors
const SELECTORS = {
  MUTE_BUTTON: '[role="button"][aria-label*="microphone"]',
  VIDEO_BUTTON: '[role="button"][aria-label*="camera"]',
  HAND_BUTTON: '[role="button"][aria-label*="Raise hand"]',
  CHAT_BUTTON: '[role="button"][aria-label*="chat"]'
};

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  switch (request.action) {
    case 'toggleMute':
      toggleMute();
      break;
    case 'toggleVideo':
      toggleVideo();
      break;
    case 'toggleHand':
      toggleHand();
      break;
    case 'toggleChat':
      toggleChat();
      break;
    case 'getState':
      const state = getMeetingState();
      sendResponse(state);
      return true;
  }
});

// Function to click a button if it exists
function clickButton(selector) {
  const button = document.querySelector(selector);
  if (button) {
    button.click();
    return true;
  }
  return false;
}

// Control functions
function toggleMute() {
  return clickButton(SELECTORS.MUTE_BUTTON);
}

function toggleVideo() {
  return clickButton(SELECTORS.VIDEO_BUTTON);
}

function toggleHand() {
  return clickButton(SELECTORS.HAND_BUTTON);
}

function toggleChat() {
  return clickButton(SELECTORS.CHAT_BUTTON);
}

// Get the current state of microphone, camera, etc.
function getMeetingState() {
  const muteButton = document.querySelector(SELECTORS.MUTE_BUTTON);
  const videoButton = document.querySelector(SELECTORS.VIDEO_BUTTON);
  const handButton = document.querySelector(SELECTORS.HAND_BUTTON);
  
  return {
    isMuted: muteButton?.getAttribute('aria-label')?.includes('Unmute') ?? false,
    isVideoOff: videoButton?.getAttribute('aria-label')?.includes('Turn on') ?? false,
    isHandRaised: handButton?.getAttribute('aria-pressed') === 'true' ?? false
  };
}

// Observe DOM changes to handle dynamic updates
const observer = new MutationObserver(() => {
  const state = getMeetingState();
  chrome.runtime.sendMessage({ type: 'stateUpdate', state });
});

// Start observing once the meeting controls are present
function startObserving() {
  const controls = document.querySelector('[role="complementary"]');
  if (controls) {
    observer.observe(controls, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-label', 'aria-pressed']
    });
  }
}

// Initialize observation when the page loads
startObserving();