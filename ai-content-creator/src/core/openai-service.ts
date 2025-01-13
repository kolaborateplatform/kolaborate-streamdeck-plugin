import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

export type ContentType = 'text' | 'image' | 'tweet' | 'blog' | 'code' | 'email' | 'social';

interface PromptTemplate {
  systemPrompt: string;
  userPromptTemplate: string;
}

const TEMPLATES: Record<ContentType, PromptTemplate> = {
  text: {
    systemPrompt: "You are a creative writer and content creator.",
    userPromptTemplate: "{prompt}"
  },
  image: {
    systemPrompt: "Create detailed image descriptions.",
    userPromptTemplate: "Create a detailed, vivid image of: {prompt}"
  },
  tweet: {
    systemPrompt: "You are a social media expert who creates engaging tweets within 280 characters.",
    userPromptTemplate: "Create an engaging tweet about: {prompt}"
  },
  blog: {
    systemPrompt: "You are a professional blog writer who creates well-structured, engaging blog posts.",
    userPromptTemplate: "Write a blog post about: {prompt}\n\nMake it engaging and include a clear structure with headings."
  },
  code: {
    systemPrompt: "You are a senior software developer who writes clean, well-documented code.",
    userPromptTemplate: "Write code for: {prompt}\n\nInclude comments and explain any complex parts."
  },
  email: {
    systemPrompt: "You are a professional email writer who creates clear, concise, and effective emails.",
    userPromptTemplate: "Write an email about: {prompt}\n\nMake it professional and to the point."
  },
  social: {
    systemPrompt: "You are a social media manager who creates engaging content for various platforms.",
    userPromptTemplate: "Create a social media post about: {prompt}\n\nMake it engaging and shareable."
  }
};

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  private getPrompt(type: ContentType, userPrompt: string): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const template = TEMPLATES[type];
    const formattedUserPrompt = template.userPromptTemplate.replace('{prompt}', userPrompt);

    return [
      { role: 'system', content: template.systemPrompt },
      { role: 'user', content: formattedUserPrompt }
    ];
  }

  async generateContent(prompt: string, type: ContentType = 'text'): Promise<string> {
    try {
      if (type === 'image') {
        const image = await this.client.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        });

        return image.data[0]?.url || 'No image generated';
      }

      const messages = this.getPrompt(type, prompt);
      const completion = await this.client.chat.completions.create({
        messages,
        model: 'gpt-4-turbo-preview',
        temperature: type === 'code' ? 0.2 : 0.7, // Lower temperature for code generation
        max_tokens: type === 'tweet' ? 100 : 1000,
      });

      return completion.choices[0]?.message?.content || 'No content generated';
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
} 