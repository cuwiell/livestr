export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateResponseParams {
  messages: Message[];
  provider?: string; // e.g. 'openai', 'mock'
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
}

export interface AIProvider {
  generateResponse(params: GenerateResponseParams): Promise<AIResponse>;
  streamResponse?(params: GenerateResponseParams): Promise<ReadableStream>;
}
