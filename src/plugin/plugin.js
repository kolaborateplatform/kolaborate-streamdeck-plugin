const streamDeck = require('@elgato-stream-deck/node');

class GoogleMeetPlugin {
  constructor() {
    // Store button states
    this.buttonStates = {
      muted: false,
      videoOff: false,
      handRaised: false
    };
    
    // Initialize Stream Deck connection
    this.streamDeck = null;
  }

  // Initialize the plugin
  async initialize(pluginContext) {
    this.streamDeck = streamDeck.getStreamDeckClient();
    
    // Register events
    this.streamDeck.on('willAppear', this.handleWillAppear.bind(this));
    this.streamDeck.on('keyDown', this.handleKeyPress.bind(this));
    
    // Connect to Stream Deck
    await this.streamDeck.connect(pluginContext);
    console.log('Plugin initialized and connected to Stream Deck');
  }

  // Handle when a button appears
  async handleWillAppear(event) {
    const { action, context } = event;
    
    // Set initial button state based on action
    switch (action) {
      case 'com.kolaborate.googlemeet.mute':
        await this.updateButtonState(context, this.buttonStates.muted);
        break;
      case 'com.kolaborate.googlemeet.video':
        await this.updateButtonState(context, this.buttonStates.videoOff);
        break;
      case 'com.kolaborate.googlemeet.hand':
        await this.updateButtonState(context, this.buttonStates.handRaised);
        break;
    }
  }

  // Handle button press
  async handleKeyPress(event) {
    const { action, context } = event;
    
    switch (action) {
      case 'com.kolaborate.googlemeet.mute':
        this.buttonStates.muted = !this.buttonStates.muted;
        await this.toggleMute();
        await this.updateButtonState(context, this.buttonStates.muted);
        break;
      
      case 'com.kolaborate.googlemeet.video':
        this.buttonStates.videoOff = !this.buttonStates.videoOff;
        await this.toggleVideo();
        await this.updateButtonState(context, this.buttonStates.videoOff);
        break;
      
      case 'com.kolaborate.googlemeet.hand':
        this.buttonStates.handRaised = !this.buttonStates.handRaised;
        await this.toggleHand();
        await this.updateButtonState(context, this.buttonStates.handRaised);
        break;
    }
  }

  // Update button appearance based on state
  async updateButtonState(context, state) {
    if (state) {
      await this.streamDeck.setTitle(context, 'ON');
      await this.streamDeck.setImage(context, this.getActiveImage());
    } else {
      await this.streamDeck.setTitle(context, 'OFF');
      await this.streamDeck.setImage(context, this.getInactiveImage());
    }
  }

  // These methods will interact with our Chrome extension
  async toggleMute() {
    // Send message to Chrome extension
    await this.sendMessageToExtension({ action: 'toggleMute' });
  }

  async toggleVideo() {
    await this.sendMessageToExtension({ action: 'toggleVideo' });
  }

  async toggleHand() {
    await this.sendMessageToExtension({ action: 'toggleHand' });
  }

  async sendMessageToExtension(message) {
    // Implementation will be added when we create the Chrome extension
    console.log('Sending message to extension:', message);
  }

  // Helper methods for button images (to be implemented)
  getActiveImage() {
    // Return base64 image for active state
    return '';
  }

  getInactiveImage() {
    // Return base64 image for inactive state
    return '';
  }
}

// Create plugin instance
const plugin = new GoogleMeetPlugin();

// Export the plugin
module.exports = plugin;