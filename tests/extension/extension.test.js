// Import necessary testing utilities
const chrome = require('sinon-chrome');
const { createMockMeetPage } = require('./helpers/meetPage');

// Mock the chrome object before running tests
global.chrome = chrome;

describe('Chrome Extension Tests', () => {
    beforeAll(() => {
        // Set up any global test environment requirements
    });

    afterAll(() => {
        // Clean up after all tests
        chrome.flush();
        delete global.chrome;
    });

    beforeEach(() => {
        // Reset chrome API mocks before each test
        chrome.reset();
    });

    describe('Extension Initialization', () => {
        it('should initialize without errors', () => {
            // This is a basic test to ensure our testing environment works
            expect(chrome).toBeDefined();
        });
    });

    describe('Content Script', () => {
        it('should be able to find Google Meet controls', () => {
            // Create a mock Meet page environment
            document.body.innerHTML = createMockMeetPage();
            
            // Verify we can find the mute button
            const muteButton = document.querySelector('[aria-label*="microphone"]');
            expect(muteButton).toBeTruthy();
        });
    });
});