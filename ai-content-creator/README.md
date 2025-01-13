# AI Content Creator - Stream Deck Plugin

This Stream Deck plugin allows you to generate AI content using OpenAI's GPT-4 and DALL-E 3 models with a single button press. The generated content is automatically copied to your clipboard.

## Features

- Generate text content using GPT-4
- Generate images using DALL-E 3
- Customizable prompts
- Automatic clipboard copying
- Visual feedback on generation status

## Prerequisites

- Stream Deck Software
- Node.js 16 or higher
- OpenAI API key

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Build the plugin:
   ```bash
   bun run build
   ```
5. Double-click the `com.elgato.ai-content-creator.sdPlugin` file to install it in Stream Deck

## Usage

1. Add the "Generate Content" action to your Stream Deck
2. Configure the action:
   - Set your desired prompt
   - Choose between text or image generation
3. Press the button to generate content
   - The button will show "..." while generating
   - Content will be automatically copied to your clipboard
   - The button will show "Done!" when complete

## Development

- `bun run build` - Build the plugin
- `bun run dev` - Build and watch for changes

## License

MIT
