// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Add custom jest matchers
require('@testing-library/jest-dom');

// Mock Stream Deck SDK
jest.mock('@elgato-stream-deck/node', () => ({
  getStreamDeckClient: jest.fn(() => ({
    connect: jest.fn(),
    on: jest.fn(),
    setTitle: jest.fn(),
    setImage: jest.fn(),
    showAlert: jest.fn(),
    showOk: jest.fn()
  }))
}));

// Mock WebSocket
jest.mock('ws', () => {
  const { Server: MockServer } = require('mock-socket');
  return { Server: MockServer };
});

// Global test utilities
global.waitFor = (condition, timeout = 5000) => {
  const startTime = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
};