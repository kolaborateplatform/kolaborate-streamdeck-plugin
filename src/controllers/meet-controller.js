const logger = require('../core/logger');
const config = require('../core/config');
const wsManager = require('../core/websocket-manager');

class GoogleMeetController {
  constructor(streamDeck) {
    this.streamDeck = streamDeck;
    this.contexts = new Map();
    this.states = new Map();
  }

  /**
   * Handle button appearance
   */
  async handleWillAppear(event) {
    const { context, action } = event;
    
    // Store context for this button
    this.contexts.set(action, context);
    
    // Update button state based on current Meet state
    await this.updateButtonState(context, action);
  }

  /**
   * Handle button disappearance
   */
  async handleWillDisappear(event) {
    const { action } = event;
    this.contexts.delete(action);
  }

  /**
   * Handle button press
   */
  async handleKeyDown(event) {
    const { action } = event;
    
    try {
      switch (action) {
        case 'com.kolaborate.googlemeet.mute':
          await this.toggleMute();
          break;
        
        case 'com.kolaborate.googlemeet.video':
          await this.toggleVideo();
          break;
        
        case 'com.kolaborate.googlemeet.hand':
          await this.toggleHand();
          break;
        
        case 'com.kolaborate.googlemeet.chat':
          await this.toggleChat();
          break;
      }
    } catch (error) {
      logger.error(`Error handling key down for action ${action}:`, error);
    }
  }

  /**
   * Handle button release
   */
  async handleKeyUp(event) {
    // Currently no special handling needed for key up
  }

  /**
   * Handle property inspector appearance
   */
  async handleInspectorAppear(event) {
    // Send current settings to property inspector
    const settings = await this.getSettings();
    await this.streamDeck.sendToPropertyInspector(event.context, settings);
  }

  /**
   * Handle Meet control messages from WebSocket
   */
  async handleMeetControl(event) {
    const { action, success } = event;
    
    // Update button state based on action result
    const context = this.contexts.get(action);
    if (context) {
      await this.updateButtonState(context, action, success);
    }
  }

  /**
   * Handle state updates from Google Meet
   */
  async handleStateUpdate(event) {
    const { state } = event;
    
    // Store new state
    this.states.set('meetState', state);
    
    // Update all button states
    for (const [action, context] of this.contexts) {
      await this.updateButtonState(context, action);
    }
  }

  /**
   * Toggle microphone mute state
   */
  async toggleMute() {
    try {
      await wsManager.sendMessage(null, {
        type: 'MEET_CONTROL',
        action: 'TOGGLE_MUTE'
      });
    } catch (error) {
      logger.error('Error toggling mute:', error);
      throw error;
    }
  }

  /**
   * Toggle video state
   */
  async toggleVideo() {
    try {
      await wsManager.sendMessage(null, {
        type: 'MEET_CONTROL',
        action: 'TOGGLE_VIDEO'
      });
    } catch (error) {
      logger.error('Error toggling video:', error);
      throw error;
    }
  }

  /**
   * Toggle hand raised state
   */
  async toggleHand() {
    try {
      await wsManager.sendMessage(null, {
        type: 'MEET_CONTROL',
        action: 'TOGGLE_HAND'
      });
    } catch (error) {
      logger.error('Error toggling hand:', error);
      throw error;
    }
  }

  /**
   * Toggle chat visibility
   */
  async toggleChat() {
    try {
      await wsManager.sendMessage(null, {
        type: 'MEET_CONTROL',
        action: 'TOGGLE_CHAT'
      });
    } catch (error) {
      logger.error('Error toggling chat:', error);
      throw error;
    }
  }

  /**
   * Update button state based on Meet state
   */
  async updateButtonState(context, action, success = true) {
    const state = this.states.get('meetState') || {};
    
    try {
      switch (action) {
        case 'com.kolaborate.googlemeet.mute':
          await this.updateMuteButton(context, state.isMuted, success);
          break;
        
        case 'com.kolaborate.googlemeet.video':
          await this.updateVideoButton(context, state.isVideoOff, success);
          break;
        
        case 'com.kolaborate.googlemeet.hand':
          await this.updateHandButton(context, state.isHandRaised, success);
          break;
        
        case 'com.kolaborate.googlemeet.chat':
          await this.updateChatButton(context, state.isChatOpen, success);
          break;
      }
    } catch (error) {
      logger.error(`Error updating button state for ${action}:`, error);
    }
  }

  /**
   * Update mute button appearance
   */
  async updateMuteButton(context, isMuted, success) {
    const title = isMuted ? 'Unmute' : 'Mute';
    const image = isMuted ? 'images/muted.png' : 'images/unmuted.png';
    
    await this.setButtonState(context, title, image, success);
  }

  /**
   * Update video button appearance
   */
  async updateVideoButton(context, isOff, success) {
    const title = isOff ? 'Start Video' : 'Stop Video';
    const image = isOff ? 'images/video-off.png' : 'images/video-on.png';
    
    await this.setButtonState(context, title, image, success);
  }

  /**
   * Update hand raised button appearance
   */
  async updateHandButton(context, isRaised, success) {
    const title = isRaised ? 'Lower Hand' : 'Raise Hand';
    const image = isRaised ? 'images/hand-raised.png' : 'images/hand-lowered.png';
    
    await this.setButtonState(context, title, image, success);
  }

  /**
   * Update chat button appearance
   */
  async updateChatButton(context, isOpen, success) {
    const title = isOpen ? 'Close Chat' : 'Open Chat';
    const image = isOpen ? 'images/chat-open.png' : 'images/chat-closed.png';
    
    await this.setButtonState(context, title, image, success);
  }

  /**
   * Set button state
   */
  async setButtonState(context, title, image, success) {
    try {
      await Promise.all([
        this.streamDeck.setTitle(context, title),
        this.streamDeck.setImage(context, image),
        success ? null : this.showError(context)
      ]);
    } catch (error) {
      logger.error('Error setting button state:', error);
    }
  }

  /**
   * Show error state on button
   */
  async showError(context) {
    try {
      await this.streamDeck.showAlert(context);
    } catch (error) {
      logger.error('Error showing alert:', error);
    }
  }

  /**
   * Get current settings
   */
  async getSettings() {
    return {
      version: config.get('version'),
      meetState: this.states.get('meetState') || {},
      wsStatus: wsManager.getStatus()
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    this.contexts.clear();
    this.states.clear();
  }
}

module.exports = { GoogleMeetController };