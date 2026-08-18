import { AIProvider, Message } from './providers';
import { Host } from '@/types/host';
import { buildSystemPrompt } from './promptBuilder';

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  username?: string;
}

export class ConversationEngine {
  private host: Host;
  private provider: AIProvider;
  
  constructor(host: Host, provider: AIProvider) {
    this.host = host;
    this.provider = provider;
  }

  /**
   * Generates a response based on rolling context.
   */
  async getResponse(
    currentComment: string,
    history: ChatHistoryItem[],
    username?: string
  ): Promise<string> {
    const messages = this.buildContextWindow(currentComment, history, username);
    
    const response = await this.provider.generateResponse({
      messages,
      temperature: 0.7 + (this.host.personality.playful * 0.2), // Playful hosts are more random
    });

    return response.content;
  }

  /**
   * Assembles the "Rolling Context"
   * Includes: System Prompt + Last N interactions + Current Comment
   */
  private buildContextWindow(
    currentComment: string,
    history: ChatHistoryItem[],
    username?: string
  ): Message[] {
    const systemPrompt = buildSystemPrompt(this.host);
    
    const messages: Message[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Take the last 15 interactions (Rolling Context)
    const recentHistory = history.slice(-15);
    
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        const prefix = msg.username ? `[${msg.username}]: ` : '';
        messages.push({ role: 'user', content: `${prefix}${msg.content}` });
      } else {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add current comment
    const prefix = username ? `[${username}]: ` : '';
    messages.push({ role: 'user', content: `${prefix}${currentComment}` });

    return messages;
  }
}
