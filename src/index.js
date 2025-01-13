require('dotenv').config();
const streamDeck = require('@elgato-stream-deck/node');
const logger = require('./core/logger');
const config = require('./core/config');
const wsManager = require('./core/websocket-manager');
const { GoogleMeetController } = require('./controllers/meet-controller');

class StreamDeckPlugin {
  constructor() {
    this.streamDeck = null;
    this.meetController = null;
    this.initialized = false;
  }

  async initialize(pluginContext) {
    try {
      logger.info('Initializing Stream Deck plugin...');

      // Initialize WebSocket manager
      await wsManager.initialize();

      // Initialize Stream Deck connection
      this.streamDeck = streamDeck.getStreamDeckClient();
      
      // Initialize Google Meet controller
      this.meetController = new GoogleMeetController(this.streamDeck);

      // Set up event handlers
      this.setupEventHandlers();

      // Connect to Stream Deck
      await this.streamDeck.connect(pluginContext);

      this.initialized = true;
      logger.info('Stream Deck plugin initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize plugin:', error);
      throw error;
    }
  }

  setupEventHandlers() {
    // Stream Deck events
    this.streamDeck.on('willAppear', this.handleWillAppear.bind(this));
    this.streamDeck.on('willDisappear', this.handleWillDisappear.bind(this));
    this.streamDeck.on('keyDown', this.handleKeyDown.bind(this));
    this.streamDeck.on('keyUp', this.handleKeyUp.bind(this));
    this.streamDeck.on('propertyInspectorDidAppear', this.handleInspectorAppear.bind(this));

    // WebSocket events
    wsManager.on('meetControl', this.handleMeetControl.bind(this));
    wsManager.on('stateUpdate', this.handleStateUpdate.bind(this));
    wsManager.on('clientError', this.handleClientError.bind(this));
  }

  // Event handlers
  async handleWillAppear(event) {
    try {
      await this.meetController.handleWillAppear(event);
    } catch (error) {
      logger.error('Error in willAppear handler:', error);
    }
  }

  async handleWillDisappear(event) {
    try {
      await this.meetController.handleWillDisappear(event);
    } catch (error) {
      logger.error('Error in willDisappear handler:', error);
    }
  }

  async handleKeyDown(event) {
    try {
      await this.meetController.handleKeyDown(event);
    } catch (error) {
      logger.error('Error in keyDown handler:', error);
    }
  }

  async handleKeyUp(event) {
    try {
      await this.meetController.handleKeyUp(event);
    } catch (error) {
      logger.error('Error in keyUp handler:', error);
    }
  }

  async handleInspectorAppear(event) {
    try {
      await this.meetController.handleInspectorAppear(event);
    } catch (error) {
      logger.error('Error in inspectorAppear handler:', error);
    }
  }

  async handleMeetControl(event) {
    try {
      await this.meetController.handleMeetControl(event);
    } catch (error) {
      logger.error('Error handling Meet control:', error);
    }
  }

  async handleStateUpdate(event) {
    try {
      await this.meetController.handleStateUpdate(event);
    } catch (error) {
      logger.error('Error handling state update:', error);
    }
  }

  handleClientError(error) {
    logger.error('WebSocket client error:', error);
  }

  async shutdown() {
    try {
      logger.info('Shutting down plugin...');
      
      // Cleanup WebSocket connections
      wsManager.shutdown();
      
      // Cleanup Meet controller
      if (this.meetController) {
        await this.meetController.cleanup();
      }

      // Disconnect from Stream Deck
      if (this.streamDeck) {
        await this.streamDeck.disconnect();
      }

      logger.info('Plugin shutdown complete');
    } catch (error) {
      logger.error('Error during shutdown:', error);
    }
  }
}

// Create plugin instance
const plugin = new StreamDeckPlugin();

// Export the plugin
module.exports = plugin;

// Handle process termination
process.on('SIGINT', async () => {
  await plugin.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await plugin.shutdown();
  process.exit(0);
});