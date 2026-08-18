import { AIProvider, GenerateResponseParams, AIResponse } from './index';

export class MockAIProvider implements AIProvider {
  async generateResponse(params: GenerateResponseParams): Promise<AIResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get the last user message
    const lastMessage = params.messages[params.messages.length - 1];
    
    // Generate a contextual mock response
    let content = "I'm sorry, I didn't quite catch that. Can you repeat?";
    
    if (lastMessage) {
      const lower = lastMessage.content.toLowerCase();
      if (lower.includes('halo') || lower.includes('hello')) {
        content = "Halo juga! Selamat datang di live stream aku hari ini. Ada yang mau ditanyain?";
      } else if (lower.includes('nama') || lower.includes('siapa')) {
        content = "Namaku Tori, aku AI host kamu! Senang bertemu denganmu.";
      } else if (lower.includes('nyanyi') || lower.includes('sing')) {
        content = "Duh, aku lagi agak serak nih, besok aja ya nyanyinya hihihi!";
      } else {
        content = "Wah menarik banget! Boleh cerita lebih lanjut tentang itu?";
      }
    }

    return {
      content,
      provider: 'mock',
      model: 'mock-v1'
    };
  }
}
