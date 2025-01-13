// This background script acts as a bridge between the Stream Deck plugin and Google Meet

// Store the active Meet tab ID for quick access
let activeMeetTabId = null;

// Listen for native messages from the Stream Deck plugin
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('Received message from Stream Deck:', message);
  
  // Forward the command to the active Meet tab
  if (activeMeetTabId) {
    chrome.tabs.sendMessage(activeMeetTabId, message, (response) => {
      sendResponse(response);
    });
    return true; // Keep the message channel open for async response
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'stateUpdate') {
    // Forward state updates to the Stream Deck plugin
    // We'll need to implement native messaging here
    console.log('State update received:', message.state);
  }
});

// Track active Meet tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('meet.google.com')) {
    activeMeetTabId = tabId;
    console.log('Active Meet tab updated:', tabId);
  }
});

// Clean up when Meet tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeMeetTabId) {
    activeMeetTabId = null;
    console.log('Meet tab closed');
  }
});