const WebSocket = require('ws');
const config = require('./config');
const logger = require('./logger');
const encryption = require('./encryption');
const EventEmitter = require('events');
const RateLimiter = require('./rate-limiter');

class WebSocketManager extends EventEmitter {
  constructor() {
    super();
    this.server = null;
    this.clients = new Map();
    this.heartbeatInterval = config.get('websocket.heartbeatInterval');
    this.reconnectAttempts = config.get('websocket.reconnectAttempts');
    this.maxMessageSize = config.get('security.maxMessageSize');
    this.rateLimiter = new RateLimiter(
      config.get('security.rateLimiting.windowMs'),
      config.get('security.rateLimiting.maxRequests')
    );
  }

  /**
   * Handle incoming messages with security checks and rate limiting
   */
  async handleMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) {
      logger.warn(`Message received from unknown client: ${clientId}`);
      return;
    }

    try {
      // Check rate limiting
      if (!this.rateLimiter.checkLimit(clientId)) {
        logger.warn(`Rate limit exceeded for client: ${clientId}`);
        this.sendError(clientId, 'Rate limit exceeded');
        return;
      }

      // Validate message size
      if (message.length > this.maxMessageSize) {
        logger.warn(`Message size exceeded for client: ${clientId}`);
        this.sendError(clientId, 'Message size limit exceeded');
        return;
      }

      // Decrypt and validate message
      const decryptedMessage = encryption.decrypt(message.toString());
      
      // Validate message structure
      if (!this.isValidMessage(decryptedMessage)) {
        logger.warn(`Invalid message structure from client: ${clientId}`);
        this.sendError(clientId, 'Invalid message structure');
        return;
      }

      // Update client metrics
      client.messageCount++;
      client.lastMessageTime = Date.now();

      // Process message based on type
      await this.processMessage(clientId, decryptedMessage);

    } catch (error) {
      logger.error(`Error processing message from ${clientId}:`, error);
      this.sendError(clientId, 'Internal error processing message');
    }
  }

  /**
   * Process different types of messages
   */
  async processMessage(clientId, message) {
    const { type, action, data } = message;

    switch (type) {
      case 'MEET_CONTROL':
        await this.handleMeetControl(clientId, action, data);
        break;

      case 'STATE_UPDATE':
        await this.handleStateUpdate(clientId, data);
        break;

      case 'HEARTBEAT':
        this.handleHeartbeat(clientId);
        break;

      default:
        logger.warn(`Unknown message type from client ${clientId}: ${type}`);
        this.sendError(clientId, 'Unknown message type');
    }
  }

  /**
   * Handle Google Meet control actions
   */
  async handleMeetControl(clientId, action, data) {
    logger.debug(`Processing Meet control action: ${action} for client: ${clientId}`);

    try {
      // Validate the action
      if (!this.isValidMeetAction(action)) {
        throw new Error('Invalid Meet action');
      }

      // Emit event for the plugin to handle
      this.emit('meetControl', {
        clientId,
        action,
        data,
        timestamp: Date.now()
      });

      // Send acknowledgment
      this.sendMessage(clientId, {
        type: 'CONTROL_ACK',
        action,
        success: true
      });

    } catch (error) {
      logger.error(`Error handling Meet control for client ${clientId}:`, error);
      this.sendError(clientId, `Failed to execute ${action}`);
    }
  }

  /**
   * Handle state updates from Google Meet
   */
  async handleStateUpdate(clientId, state) {
    logger.debug(`Processing state update for client: ${clientId}`);

    try {
      // Validate state structure
      if (!this.isValidState(state)) {
        throw new Error('Invalid state structure');
      }

      // Emit event for plugin to handle
      this.emit('stateUpdate', {
        clientId,
        state,
        timestamp: Date.now()
      });

    } catch (error) {
      logger.error(`Error handling state update for client ${clientId}:`, error);
      this.sendError(clientId, 'Invalid state update');
    }
  }

  /**
   * Send a message to a client
   */
  sendMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client || client.ws.readyState !== WebSocket.OPEN) {
      logger.warn(`Attempted to send message to unavailable client: ${clientId}`);
      return false;
    }

    try {
      const encryptedMessage = encryption.encrypt(message);
      client.ws.send(encryptedMessage);
      return true;
    } catch (error) {
      logger.error(`Error sending message to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Send an error message to a client
   */
  sendError(clientId, message) {
    return this.sendMessage(clientId, {
      type: 'ERROR',
      message,
      timestamp: Date.now()
    });
  }

  /**
   * Start heartbeat monitoring for a client
   */
  startHeartbeat(clientId) {
    const interval = setInterval(() => {
      const client = this.clients.get(clientId);
      if (!client) {
        clearInterval(interval);
        return;
      }

      const now = Date.now();
      const lastMessageAge = now - client.lastMessageTime;

      if (lastMessageAge > this.heartbeatInterval * 2) {
        logger.warn(`Client ${clientId} heartbeat timeout`);
        this.handleClose(clientId);
        clearInterval(interval);
      } else {
        this.sendMessage(clientId, { type: 'PING' });
      }
    }, this.heartbeatInterval);

    // Store interval reference
    const client = this.clients.get(clientId);
    if (client) {
      client.heartbeatInterval = interval;
    }
  }

  /**
   * Handle client disconnection
   */
  handleClose(clientId) {
    const client = this.clients.get(clientId);
    if (client) {
      // Clear heartbeat interval
      if (client.heartbeatInterval) {
        clearInterval(client.heartbeatInterval);
      }

      // Clean up client data
      this.clients.delete(clientId);
      this.rateLimiter.removeClient(clientId);

      logger.info(`Client disconnected: ${clientId}`);
      this.emit('clientDisconnected', clientId);
    }
  }

  /**
   * Handle client errors
   */
  handleError(clientId, error) {
    logger.error(`WebSocket error for client ${clientId}:`, error);
    this.emit('clientError', { clientId, error });
  }

  /**
   * Handle server errors
   */
  handleServerError(error) {
    logger.error('WebSocket server error:', error);
    this.emit('serverError', error);
  }

  /**
   * Validate message structure
   */
  isValidMessage(message) {
    return message &&
           typeof message === 'object' &&
           typeof message.type === 'string' &&
           message.type.length > 0;
  }

  /**
   * Validate Meet action
   */
  isValidMeetAction(action) {
    const validActions = [
      'TOGGLE_MUTE',
      'TOGGLE_VIDEO',
      'TOGGLE_HAND',
      'TOGGLE_CHAT',
      'JOIN_MEETING',
      'LEAVE_MEETING'
    ];
    return validActions.includes(action);
  }

  /**
   * Validate state structure
   */
  isValidState(state) {
    return state &&
           typeof state === 'object' &&
           typeof state.isMuted !== 'undefined' &&
           typeof state.isVideoOff !== 'undefined' &&
           typeof state.isHandRaised !== 'undefined';
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate connection origin
   */
  isValidOrigin(origin) {
    // Add your origin validation logic here
    const validOrigins = [
      'chrome-extension://',
      'http://localhost',
      'https://meet.google.com'
    ];
    return validOrigins.some(valid => origin?.startsWith(valid));
  }

  /**
   * Shutdown the WebSocket server
   */
  shutdown() {
    if (this.server) {
      // Close all client connections
      this.clients.forEach((client, clientId) => {
        this.handleClose(clientId);
      });

      // Close server
      this.server.close(() => {
        logger.info('WebSocket server shut down');
      });
    }
  }
}

module.exports = new WebSocketManager();