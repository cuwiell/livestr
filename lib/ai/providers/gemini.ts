import { AIProvider, GenerateResponseParams, AIResponse } from './index';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export class GeminiProvider implements AIProvider {
  async generateResponse(params: GenerateResponseParams): Promise<AIResponse> {
    try {
      const systemMessage = params.messages.find(msg => msg.role === 'system');
      const chatMessages = params.messages.filter(msg => msg.role !== 'system');
      
      // Map generic messages to Vercel AI SDK CoreMessages
      const coreMessages = chatMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const { text } = await generateText({
        model: google('gemini-1.5-flash'),
        system: systemMessage?.content,
        messages: coreMessages,
        temperature: params.temperature ?? 0.7,
      });

      return {
        content: text,
        provider: 'gemini',
        model: 'gemini-1.5-flash'
      };
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }
}
