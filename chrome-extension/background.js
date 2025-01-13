// WebSocket connection to Stream Deck plugin
let ws = null;
let activeTabId = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;

// Connect to Stream Deck plugin
function connectWebSocket() {
  ws = new WebSocket('ws://localhost:12345');

  ws.onopen = () => {
    console.log('Connected to Stream Deck plugin');
    reconnectAttempts = 0;
  };

  ws.onmessage = async (event) => {
    try {
      const message = JSON.parse(event.data);
      
      if (message.type === 'encrypted') {
        // In production, decrypt message here
        const decryptedMessage = message.data; // Replace with actual decryption
        handleMessage(decryptedMessage);
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  ws.onclose = () => {
    console.log('WebSocket connection closed');
    attemptReconnect();
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
}

function attemptReconnect() {
  if (reconnectAttempts < maxReconnectAttempts) {
    reconnectAttempts++;
    setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
      connectWebSocket();
    }, 2000 * reconnectAttempts);
  }
}

async function handleMessage(message) {
  if (!activeTabId) {
    const [tab] = await chrome.tabs.query({ url: 'https://meet.google.com/*', active: true });
    if (tab) {
      activeTabId = tab.id;
    } else {
      console.error('No active Google Meet tab found');
      return;
    }
  }

  // Forward message to content script
  chrome.tabs.sendMessage(activeTabId, message);
}

// Listen for tab updates to track active Google Meet tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('meet.google.com')) {
    activeTabId = tabId;
  }
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url?.includes('meet.google.com')) {
    activeTabId = tab.id;
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.tab?.id === activeTabId && ws?.readyState === WebSocket.OPEN) {
    // In production, encrypt message here
    const encryptedMessage = {
      type: 'encrypted',
      data: message // Replace with actual encryption
    };
    ws.send(JSON.stringify(encryptedMessage));
  }
});

// Initial connection
connectWebSocket(); 