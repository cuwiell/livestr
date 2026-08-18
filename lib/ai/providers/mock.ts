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
      const match = lastMessage.content.match(/^\[(.*?)\]:\s*(.*)/);
      const username = match ? match[1] : 'Kakak';
      const text = match ? match[2] : lastMessage.content;
      const lower = text.toLowerCase();

      if (text.includes('[GIFT]')) {
        const giftName = text.replace('[GIFT] ', '');
        content = `Wahhh! Makasih banyak ya kak ${username} buat ${giftName} nya! Berkah selalu rezekinya kak!`;
      } else if (lower.includes('halo') || lower.includes('hello') || lower.includes('hai')) {
        content = `Halo juga kak ${username}! Selamat datang di live stream aku hari ini. Jangan lupa tap tap layarnya ya!`;
      } else if (lower.includes('nama') || lower.includes('siapa')) {
        content = `Salam kenal kak ${username}, namaku Host AI. Aku di sini buat nemenin kalian ngobrol santai.`;
      } else if (lower.includes('umur') || lower.includes('berapa')) {
        content = `Wah kalau umur sih rahasia ya kak ${username}, yang pasti aku awet muda terus hehehe.`;
      } else if (lower.includes('tinggal') || lower.includes('dimana')) {
        content = `Aku tinggal di dalam server cloud nih kak ${username}. Tapi hati aku selalu dekat sama kalian asikkk.`;
      } else if (lower.includes('cantik') || lower.includes('ganteng')) {
        content = `Aduh kak ${username} bisa aja deh, makasih banyak loh pujiannya! Jadi malu aku.`;
      } else if (lower.includes('nyanyi') || lower.includes('lagu')) {
        content = `Aduh kak ${username}, suaraku lagi agak serak nih, besok-besok aja ya nyanyinya hihihi.`;
      } else {
        const randomResponses = [
          `Wah menarik banget tuh kak ${username}! Boleh cerita lebih lanjut?`,
          `Hahaha bener banget tuh kak ${username}, aku setuju seratus persen!`,
          `Oh gitu ya kak ${username}? Terus-terus gimana tuh kelanjutannya?`,
          `Wah kak ${username} ada-ada aja nih pertanyaannya. Tapi keren sih!`
        ];
        content = randomResponses[Math.floor(Math.random() * randomResponses.length)];
      }
    }

    return {
      content,
      provider: 'mock',
      model: 'mock-v1'
    };
  }
}
