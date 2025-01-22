// Basic content script for testing Google Meet controls
console.log('Google Meet Stream Deck Controller: Content Script Loaded');

// Selectors for Google Meet controls
const SELECTORS = {
  MUTE_BUTTON: '[role="button"][aria-label*="microphone"]',
  VIDEO_BUTTON: '[role="button"][aria-label*="camera"]',
  HAND_BUTTON: '[role="button"][aria-label*="Raise hand"]',
  LEAVE_BUTTON: '[role="button"][aria-label*="Leave call"]'
};

// Simple test function to check if controls are found
function testControlsPresence() {
  const controls = {
    mute: document.querySelector(SELECTORS.MUTE_BUTTON),
    video: document.querySelector(SELECTORS.VIDEO_BUTTON),
    hand: document.querySelector(SELECTORS.HAND_BUTTON),
    leave: document.querySelector(SELECTORS.LEAVE_BUTTON)
  };

  console.log('Google Meet Controls Status:', {
    muteFound: !!controls.mute,
    videoFound: !!controls.video,
    handFound: !!controls.hand,
    leaveFound: !!controls.leave
  });

  return controls;
}

// Test message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message);
  
  if (message.action === 'testControls') {
    const controls = testControlsPresence();
    sendResponse({ success: true, controls: Object.keys(controls).map(key => ({ 
      control: key, 
      found: !!controls[key] 
    }))});
  }
  
  // Always return true for async response
  return true;
});
