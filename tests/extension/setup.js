// Import testing utilities
require('@testing-library/jest-dom');
const chrome = require('sinon-chrome');

// Set up global test environment
global.chrome = chrome;

// Mock browser APIs that might be needed
global.WebSocket = require('ws');

// Add custom matchers
expect.extend({
    toHaveBeenCalledWithMatchingObject(received, expectedObj) {
        const calls = received.mock.calls;
        const match = calls.some(call => {
            const actualObj = call[0];
            return Object.keys(expectedObj).every(key => 
                actualObj[key] === expectedObj[key]
            );
        });

        return {
            pass: match,
            message: () => `expected ${received} to have been called with an object matching ${JSON.stringify(expectedObj)}`
        };
    }
});

// Clean up after each test
afterEach(() => {
    chrome.reset();
    document.body.innerHTML = '';
});

// Clean up after all tests
afterAll(() => {
    chrome.flush();
    delete global.chrome;
});