export type ContentType = 'text' | 'image' | 'tweet' | 'blog' | 'code' | 'email' | 'social';
export declare class OpenAIService {
    private client;
    constructor();
    private getPrompt;
    generateContent(prompt: string, type?: ContentType): Promise<string>;
}
