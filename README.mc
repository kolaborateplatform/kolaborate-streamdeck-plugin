# Kolaborate Google Meet Stream Deck Plugin

This plugin provides seamless control of Google Meet from your Elgato Stream Deck, offering an intuitive physical interface for managing virtual meetings.

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development Guide](#development-guide)
- [Contributing](#contributing)
- [License](#license)

## Features

Our plugin provides essential controls for Google Meet:

### Meeting Controls
- Mute/unmute audio
- Toggle video on/off
- Raise/lower hand
- Leave meeting

### Technical Features
- Secure WebSocket communication between plugin and Chrome extension
- Encryption service for secure data transmission
- Real-time status updates with visual feedback
- Automatic connection management

## Project Structure

The project consists of three main components:

```plaintext
kolaborate-streamdeck-plugin/
├── google-meet-controls/           # Stream Deck Plugin
│   ├── src/
│   │   ├── core/                  # Core services
│   │   │   ├── websocket-manager.ts
│   │   │   └── encryption.ts
│   │   ├── actions/              # Meeting control actions
│   │   │   ├── mute.ts
│   │   │   ├── video.ts
│   │   │   ├── handRaise.ts
│   │   │   └── leave.ts
│   │   └── plugin.ts            # Main entry point
│   │
│   ├── com.elgato.google-meet-controls.sdPlugin/
│   └── package.json
│
├── chrome-extension/              # Chrome Extension
│   ├── manifest.json
│   ├── background.js             # Background service worker
│   └── content.js                # Google Meet interface
│
└── README.md

```

## Installation

1. Install the Chrome extension:
   - Load the `chrome-extension` directory as an unpacked extension in Chrome
   - Enable the extension for Google Meet

2. Install the Stream Deck plugin:
   - Double-click the plugin file in the `google-meet-controls/Release` directory
   - The Stream Deck software will install it automatically

## Development Guide

### Prerequisites
- Node.js and Bun package manager
- Stream Deck Software
- Chrome browser

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   cd google-meet-controls
   bun install
   ```

3. Build the plugin:
   ```bash
   bun run build
   ```

4. For development mode:
   ```bash
   bun run dev
   ```

## Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ by Kolaborate for the African developer community.