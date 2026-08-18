import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `A 9:16 vertical portrait of: ${prompt}. High quality, detailed character design.`,
        n: 1,
        size: '1024x1792',
      }),
    });

    let data = await response.json();

    // Fallback to DALL-E 2 if DALL-E 3 is not available on the user's API tier
    if (!response.ok && data.error?.message?.includes('does not exist')) {
      console.log('Falling back to dall-e-2...');
      response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-2',
          prompt: `A beautiful portrait of: ${prompt}. High quality character design.`,
          n: 1,
          size: '1024x1024',
        }),
      });
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate image');
    }

    return NextResponse.json({
      success: true,
      url: data.data[0].url,
    });
  } catch (error: any) {
    console.error('DALL-E Generation Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
