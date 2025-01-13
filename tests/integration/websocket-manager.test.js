const WebSocket = require('ws');
const WS = require('jest-websocket-mock');
const wsManager = require('../../src/core/websocket-manager');
const encryption = require('../../src/core/encryption');
const config = require('../../src/core/config');

describe('WebSocket Manager Integration', () => {
  let mockServer;
  const PORT = 12345;
  const URL = `ws://localhost:${PORT}`;

  beforeEach(async () => {
    // Create mock WebSocket server
    mockServer = new WS(URL);
    await wsManager.initialize();
  });

  afterEach(() => {
    WS.clean();
    wsManager.shutdown();
  });

  describe('Connection Management', () => {
    it('should establish connection successfully', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();
      expect(mockServer.clients.size).toBe(1);
    });

    it('should handle client disconnection gracefully', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();
      
      client.close();
      await expect(mockServer.clients.size).toBe(0);
    });

    it('should reconnect automatically on connection loss', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();
      
      // Simulate server crash
      mockServer.close();
      
      // Create new server
      mockServer = new WS(URL);
      
      // Wait for reconnection
      await waitFor(() => mockServer.clients.size === 1);
    });
  });

  describe('Message Handling', () => {
    it('should handle Meet control messages', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      const controlMessage = {
        type: 'MEET_CONTROL',
        action: 'TOGGLE_MUTE',
        data: { timestamp: Date.now() }
      };

      const encrypted = encryption.encrypt(controlMessage);
      client.send(encrypted);

      // Wait for message processing
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify message handling
      expect(wsManager.getLastAction()).toBe('TOGGLE_MUTE');
    });

    it('should handle state updates', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      const stateUpdate = {
        type: 'STATE_UPDATE',
        state: {
          isMuted: true,
          isVideoOff: false,
          isHandRaised: false
        }
      };

      const encrypted = encryption.encrypt(stateUpdate);
      client.send(encrypted);

      // Wait for state update
      await waitFor(() => {
        const currentState = wsManager.getCurrentState();
        return currentState && currentState.isMuted === true;
      });
    });

    it('should reject messages exceeding size limit', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      // Create large message
      const largeMessage = {
        type: 'TEST',
        data: 'x'.repeat(config.get('security.maxMessageSize') + 1)
      };

      const encrypted = encryption.encrypt(largeMessage);
      client.send(encrypted);

      // Wait for error response
      await expect(mockServer).toReceiveMessage(
        expect.stringContaining('Message size limit exceeded')
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit excessive messages', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      const message = encryption.encrypt({ type: 'TEST', data: 'test' });

      // Send messages rapidly
      const promises = [];
      for (let i = 0; i < config.get('security.rateLimiting.maxRequests') + 1; i++) {
        promises.push(client.send(message));
      }

      await Promise.all(promises);

      // Wait for rate limit response
      await expect(mockServer).toReceiveMessage(
        expect.stringContaining('Rate limit exceeded')
      );
    });

    it('should release rate limit after window expires', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      // Send messages until rate limited
      const message = encryption.encrypt({ type: 'TEST', data: 'test' });
      for (let i = 0; i < config.get('security.rateLimiting.maxRequests') + 1; i++) {
        client.send(message);
      }

      // Wait for rate limit window to expire
      await new Promise(resolve => 
        setTimeout(resolve, config.get('security.rateLimiting.windowMs'))
      );

      // Should be able to send message again
      client.send(message);
      await expect(mockServer).toReceiveMessage();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed messages gracefully', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      // Send malformed message
      client.send('malformed{json:data}');

      // Should receive error response
      await expect(mockServer).toReceiveMessage(
        expect.stringContaining('Invalid message format')
      );
    });

    it('should handle encryption errors gracefully', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      // Send improperly encrypted message
      client.send('invalid:encrypted:data');

      // Should receive error response
      await expect(mockServer).toReceiveMessage(
        expect.stringContaining('Decryption failed')
      );
    });

    it('should handle connection errors gracefully', async () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Try to connect to non-existent server
      const badClient = new WebSocket('ws://localhost:9999');
      
      // Wait for error handling
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });

  describe('Performance', () => {
    it('should handle high message throughput', async () => {
      const client = new WebSocket(URL);
      await expect(mockServer).toReceiveMessage();

      const message = encryption.encrypt({ type: 'TEST', data: 'test' });
      const messageCount = 1000;
      let successCount = 0;

      // Send many messages rapidly
      for (let i = 0; i < messageCount; i++) {
        client.send(message);
        const response = await mockServer.nextMessage;
        if (response) successCount++;
      }

      expect(successCount).toBe(messageCount);
    });

    it('should maintain performance under load', async () => {
      const clients = [];
      const clientCount = 10;
      
      // Connect multiple clients
      for (let i = 0; i < clientCount; i++) {
        const client = new WebSocket(URL);
        clients.push(client);
        await expect(mockServer).toReceiveMessage();
      }

      const message = encryption.encrypt({ type: 'TEST', data: 'test' });
      const messageCount = 100;
      const startTime = Date.now();

      // Send messages from all clients simultaneously
      await Promise.all(clients.map(client => {
        const promises = [];
        for (let i = 0; i < messageCount; i++) {
          promises.push(client.send(message));
        }
        return Promise.all(promises);
      }));

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Check if processing time is within acceptable range
      expect(duration).toBeLessThan(5000); // 5 seconds max

      // Cleanup
      clients.forEach(client => client.close());
    });
  });
});
