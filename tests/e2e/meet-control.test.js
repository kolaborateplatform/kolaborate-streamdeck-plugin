const puppeteer = require('puppeteer');
const { getStreamDeckClient } = require('@elgato-stream-deck/node');
const wsManager = require('../../src/core/websocket-manager');
const config = require('../../src/core/config');

describe('Google Meet Control E2E Tests', () => {
  let browser;
  let page;
  let streamDeck;

  beforeAll(async () => {
    // Initialize Stream Deck plugin
    streamDeck = getStreamDeckClient();
    await streamDeck.connect({
      plugin: { uuid: config.get('STREAMDECK_PLUGIN_UUID') }
    });

    // Initialize WebSocket manager
    await wsManager.initialize();

    // Launch browser with specific testing configurations
    browser = await puppeteer.launch({
      headless: false, // We use false for visual verification during development
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        `--load-extension=${process.env.CHROME_EXTENSION_PATH}`,
        '--disable-web-security', // Required for extension testing
        '--allow-running-insecure-content'
      ],
      defaultViewport: {
        width: 1280,
        height: 720
      }
    });
  });

  afterAll(async () => {
    await browser.close();
    await wsManager.shutdown();
    await streamDeck.disconnect();
  });

  beforeEach(async () => {
    // Create new page with enhanced error logging
    page = await browser.newPage();
    
    // Enable detailed console logging
    page.on('console', msg => console.log('Browser Console:', msg.text()));
    page.on('error', err => console.error('Browser Error:', err));
    page.on('pageerror', err => console.error('Page Error:', err));
    
    // Enable network request logging
    page.on('request', request => {
      console.log('Request:', request.url());
    });
    
    // Set up browser permissions
    await setupBrowserPermissions(page);

    // Navigate to Google Meet with proper setup
    await navigateToMeetWithSetup(page);
  });

  afterEach(async () => {
    // Capture screenshot on test failure
    if (testFailed) {
      await page.screenshot({
        path: `failure-${Date.now()}.png`,
        fullPage: true
      });
    }
    await page.close();
  });

  describe('Basic Controls', () => {
    // ... Previous test cases remain the same ...

    it('should handle chat panel interactions', async () => {
      // Check initial chat panel state
      const initialChatState = await getChatPanelState(page);

      // Toggle chat panel
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.chat',
        context: 'test'
      });

      // Wait for state change
      await waitForChatPanelState(page, !initialChatState);

      // Verify Stream Deck button state
      const buttonState = await getStreamDeckButtonState('chat');
      expect(buttonState.title).toBe(initialChatState ? 'Open Chat' : 'Close Chat');

      // Verify chat functionality
      if (!initialChatState) {
        // Try sending a test message
        await page.type('[aria-label="Send a message to everyone"]', 'Test message');
        await page.keyboard.press('Enter');

        // Verify message appears in chat
        const messageVisible = await page.waitForSelector(
          'text/Test message',
          { timeout: 5000 }
        );
        expect(messageVisible).toBeTruthy();
      }
    });
  });

  describe('Advanced Features', () => {
    it('should handle presentation controls', async () => {
      // Upload a test presentation
      const fileInput = await page.waitForSelector('input[type="file"]');
      await fileInput.uploadFile('test-resources/sample-presentation.pdf');

      // Wait for presentation to load
      await page.waitForSelector('[aria-label="Present now"]');

      // Start presentation via Stream Deck
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.present',
        context: 'test'
      });

      // Verify presentation mode
      const isPresentingSelector = '[aria-label="You are presenting"]';
      await page.waitForSelector(isPresentingSelector);
      
      const isPresenting = await page.evaluate((selector) => {
        return !!document.querySelector(selector);
      }, isPresentingSelector);
      
      expect(isPresenting).toBe(true);

      // Test presentation navigation
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.next_slide',
        context: 'test'
      });

      // Verify slide change
      const slideNumber = await getSlideNumber(page);
      expect(slideNumber).toBe(2);
    });

    it('should handle breakout room controls', async () => {
      // Create breakout rooms
      await createBreakoutRooms(page, 2);

      // Verify Stream Deck shows breakout room controls
      const buttonState = await getStreamDeckButtonState('breakout');
      expect(buttonState.visible).toBe(true);

      // Test room navigation
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.next_room',
        context: 'test'
      });

      // Verify room change
      const currentRoom = await getCurrentBreakoutRoom(page);
      expect(currentRoom).toBe('Room 2');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from extension crash', async () => {
      // Get initial states
      const initialStates = await getAllStates(page);

      // Simulate extension crash
      await page.evaluate(() => {
        chrome.runtime.reload();
      });

      // Wait for extension recovery
      await waitForTimeout(2000);

      // Verify states are preserved
      const finalStates = await getAllStates(page);
      expect(finalStates).toEqual(initialStates);

      // Verify controls still work
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.mute',
        context: 'test'
      });

      // Wait for state change
      await waitForMuteState(page, !initialStates.mute);
    });

    it('should handle multiple Meet tabs', async () => {
      // Open second Meet tab
      const secondPage = await browser.newPage();
      await navigateToMeetWithSetup(secondPage);

      // Switch between tabs
      await page.bringToFront();
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.mute',
        context: 'test'
      });

      await secondPage.bringToFront();
      await streamDeck.keyDown({
        action: 'com.kolaborate.googlemeet.mute',
        context: 'test'
      });

      // Verify independent state management
      const firstTabMuted = await getMuteState(page);
      const secondTabMuted = await getMuteState(secondPage);
      expect(firstTabMuted).not.toBe(secondTabMuted);

      await secondPage.close();
    });
  });
});

// Helper Functions

async function setupBrowserPermissions(page) {
  const permissionSettings = [
    { setting: 'camera', value: 'allow' },
    { setting: 'microphone', value: 'allow' },
    { setting: 'notifications', value: 'allow' }
  ];

  for (const { setting, value } of permissionSettings) {
    await page.goto(`chrome://settings/content/${setting}`);
    await page.evaluate((setting, value) => {
      chrome.contentSettings[setting].set({
        primaryPattern: '<all_urls>',
        setting: value
      });
    }, setting, value);
  }
}

async function navigateToMeetWithSetup(page) {
  // Navigate with error handling
  try {
    await page.goto('https://meet.google.com');
    await page.waitForSelector('[role="button"][aria-label*="microphone"]', {
      timeout: 10000
    });
  } catch (error) {
    console.error('Navigation failed:', error);
    throw error;
  }

  // Wait for extension initialization
  await page.waitForFunction(() => {
    return window.__MEET_EXTENSION_INITIALIZED__;
  }, { timeout: 5000 });
}

async function getAllStates(page) {
  return {
    mute: await getMuteState(page),
    video: await getVideoState(page),
    hand: await getHandState(page),
    chat: await getChatPanelState(page),
    presenting: await getPresentationState(page)
  };
}

async function getMuteState(page) {
  return await page.evaluate(() => {
    const button = document.querySelector('[role="button"][aria-label*="microphone"]');
    return button.getAttribute('aria-label').includes('Unmute');
  });
}

async function getVideoState(page) {
  return await page.evaluate(() => {
    const button = document.querySelector('[role="button"][aria-label*="camera"]');
    return button.getAttribute('aria-label').includes('Turn on');
  });
}

async function getHandState(page) {
  return await page.evaluate(() => {
    const button = document.querySelector('[role="button"][aria-label*="Raise hand"]');
    return button.getAttribute('aria-pressed') === 'true';
  });
}

async function getChatPanelState(page) {
  return await page.evaluate(() => {
    const panel = document.querySelector('[aria-label="Chat with everyone"]');
    return window.getComputedStyle(panel).display !== 'none';
  });
}

async function getPresentationState(page) {
  return await page.evaluate(() => {
    return !!document.querySelector('[aria-label="You are presenting"]');
  });
}

async function getSlideNumber(page) {
  return await page.evaluate(() => {
    const element = document.querySelector('[aria-label="Slide number"]');
    return parseInt(element.textContent.split('/')[0].trim());
  });
}

async function getCurrentBreakoutRoom(page) {
  return await page.evaluate(() => {
    const roomLabel = document.querySelector('[aria-label="Current room"]');
    return roomLabel.textContent.trim();
  });
}

async function createBreakoutRooms(page, count) {
  await page.click('[aria-label="More options"]');
  await page.click('text/Breakout rooms');
  
  // Set room count
  await page.type('[aria-label="Number of rooms"]', count.toString());
  
  // Create rooms
  await page.click('text/Create');
  
  // Wait for rooms to be created
  await page.waitForSelector('[aria-label="Breakout room controls"]');
}

async function waitForTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForMuteState(page, expectedState, timeout = 5000) {
  await page.waitForFunction(
    (state) => {
      const button = document.querySelector('[role="button"][aria-label*="microphone"]');
      return button.getAttribute('aria-label').includes('Unmute') === state;
    },
    { timeout },
    expectedState
  );
}

async function getStreamDeckButtonState(action) {
  const state = await streamDeck.getState(`com.kolaborate.googlemeet.${action}`);
  return {
    title: state.title,
    image: state.image,
    visible: state.visible
  };
}
