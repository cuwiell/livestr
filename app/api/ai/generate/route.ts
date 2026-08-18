import { NextResponse } from 'next/server';
import { MockAIProvider } from '@/lib/ai/providers/mock';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { ConversationEngine } from '@/lib/ai/conversationEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host, currentComment, history, username, provider: providerName } = body;

    if (!host || !currentComment) {
      return NextResponse.json(
        { error: 'Missing required parameters (host, currentComment)' },
        { status: 400 }
      );
    }

    // Select provider based on request (or default to mock if no API key is present)
    let provider;
    if (providerName === 'openai' && process.env.OPENAI_API_KEY) {
      provider = new OpenAIProvider();
    } else if (providerName === 'gemini' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      provider = new GeminiProvider();
    } else {
      // Fallback to mock for development/MVP
      provider = new MockAIProvider();
    }

    const engine = new ConversationEngine(host, provider);
    
    const responseText = await engine.getResponse(currentComment, history || [], username);

    let actualProvider = 'mock';
    if (providerName === 'openai' && process.env.OPENAI_API_KEY) actualProvider = 'openai';
    if (providerName === 'gemini' && process.env.GOOGLE_GENERATIVE_AI_API_KEY) actualProvider = 'gemini';

    return NextResponse.json({
      success: true,
      data: {
        text: responseText,
        provider: actualProvider
      }
    });

  } catch (error: unknown) {
    console.error('AI Generate Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
