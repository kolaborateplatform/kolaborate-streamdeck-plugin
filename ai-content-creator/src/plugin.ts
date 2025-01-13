import { WebSocketManager } from './core/websocket-manager';
import { ContentType, OpenAIService } from './core/openai-service';

interface StreamDeckEvent {
  action: string;
  event: string;
  context: string;
  payload: any;
}

class AIContentCreatorPlugin {
  private ws: WebSocketManager;
  private openai: OpenAIService;
  private contexts: Map<string, { prompt: string }>;
  private outputWindow: Window | null = null;

  constructor() {
    // Get connection parameters from environment
    const args = process.argv;
    const port = args[2];
    const pluginUUID = args[4];
    const registerEvent = args[6];
    const info = args[8];

    this.contexts = new Map();
    
    // Initialize WebSocket connection
    this.ws = new WebSocketManager(
      parseInt(port),
      pluginUUID,
      registerEvent,
      info
    );

    // Initialize OpenAI service
    this.openai = new OpenAIService();

    // Set up message handling
    this.ws.onMessage(this.handleMessage.bind(this));

    // Initialize output window
    this.createOutputWindow();
  }

  private createOutputWindow() {
    const width = 600;
    const height = 800;
    const left = screen.width - width;
    const top = (screen.height - height) / 2;

    this.outputWindow = window.open(
      'output.html',
      'AI Content Output',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }

  private async handleMessage(message: StreamDeckEvent): Promise<void> {
    switch (message.event) {
      case 'keyDown':
        await this.handleKeyDown(message.context, message.action);
        break;
      case 'willAppear':
        this.contexts.set(message.context, {
          prompt: message.payload?.settings?.prompt || this.getDefaultPrompt(message.action)
        });
        break;
      case 'didReceiveSettings':
        this.contexts.set(message.context, {
          prompt: message.payload?.settings?.prompt || this.getDefaultPrompt(message.action)
        });
        break;
    }
  }

  private getDefaultPrompt(action: string): string {
    const defaults: Record<string, string> = {
      'com.elgato.ai-content-creator.text': 'Generate a creative story',
      'com.elgato.ai-content-creator.tweet': 'Write an engaging tweet about technology',
      'com.elgato.ai-content-creator.blog': 'Write a blog post about AI',
      'com.elgato.ai-content-creator.code': 'Write a Hello World program',
      'com.elgato.ai-content-creator.image': 'A futuristic cityscape at night'
    };
    return defaults[action] || 'Generate content';
  }

  private getContentType(action: string): ContentType {
    const types: Record<string, ContentType> = {
      'com.elgato.ai-content-creator.text': 'text',
      'com.elgato.ai-content-creator.tweet': 'tweet',
      'com.elgato.ai-content-creator.blog': 'blog',
      'com.elgato.ai-content-creator.code': 'code',
      'com.elgato.ai-content-creator.image': 'image'
    };
    return types[action] || 'text';
  }

  private async handleKeyDown(context: string, action: string): Promise<void> {
    try {
      const settings = this.contexts.get(context);
      if (!settings) return;

      this.ws.setTitle(context, '...');
      
      const contentType = this.getContentType(action);
      const content = await this.openai.generateContent(
        settings.prompt,
        contentType
      );

      // Display content in output window
      if (this.outputWindow) {
        this.outputWindow.postMessage({ content, type: contentType }, '*');
      }

      this.ws.showOk(context);
      this.ws.setTitle(context, 'Done!');
      
      setTimeout(() => {
        this.ws.setTitle(context, '');
      }, 2000);
    } catch (error) {
      console.error('Error handling key down:', error);
      this.ws.showAlert(context);
      this.ws.setTitle(context, 'Error');
    }
  }
}

// Start the plugin
new AIContentCreatorPlugin(); 