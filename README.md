# Kolaborate Google Meet Stream Deck Plugin

This plugin provides seamless control of Google Meet from your Elgato Stream Deck, offering an intuitive physical interface for managing virtual meetings.

## Features

- **Quick Microphone Control**: Toggle your microphone on/off with a single button press
- **One-Touch Meeting Exit**: Leave Google Meet meetings instantly
- **Visual Feedback**: Clear button states show your current microphone status
- **Chrome Extension Integration**: Works seamlessly with Google Meet in Chrome

## Actions

### Microphone
Toggle your microphone state in Google Meet meetings:
- Shows green when microphone is active
- Shows red when muted
- Provides visual feedback on state changes

### Leave
Instantly exit from your current Google Meet meeting:
- Single press to leave
- Confirms exit with visual feedback

## Installation

### Prerequisites
- Elgato Stream Deck (any model)
- Google Chrome browser
- Stream Deck software installed

### Development Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/kolaborateplatform/kolaborate-streamdeck-plugin
   ```

2. Navigate to the plugin directory:
   ```bash
   cd kolaborate-streamdeck-plugin/google-meets
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

4. Build the plugin:
   ```bash
   bun run build
   ```

5. Install Stream Deck CLI (if not already installed):
   ```bash
   bun install -g @elgato-stream-deck/cli
   ```

6. Link the plugin to Stream Deck:
   ```bash
   streamdeck link
   ```

Note: Make sure you're in the `google-meets` directory before running the installation and build commands. The Stream Deck CLI commands must also be run from this directory to properly link the plugin.

## Usage
After installation, the Google Meet actions will appear in your Stream Deck actions list under the "Google Meet" category. Drag and drop them onto your Stream Deck to start using them.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
