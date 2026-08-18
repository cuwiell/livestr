import { AIProvider, GenerateResponseParams, AIResponse } from './index';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export class OpenAIProvider implements AIProvider {
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
        model: openai('gpt-4o-mini'),
        system: systemMessage?.content,
        messages: coreMessages,
        temperature: params.temperature ?? 0.7,
      });

      return {
        content: text,
        provider: 'openai',
        model: 'gpt-4o-mini'
      };
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }
}
