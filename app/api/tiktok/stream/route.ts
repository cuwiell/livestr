import { NextRequest } from 'next/server';
import { TikTokLiveConnection } from 'tiktok-live-connector';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username');

  if (!username) {
    return new Response('Missing username', { status: 400 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let tiktokLiveConnection: TikTokLiveConnection | null = null;

      try {
        tiktokLiveConnection = new TikTokLiveConnection(username, {});

        // Setup events before connecting
        // @ts-ignore
        tiktokLiveConnection.on('chat', (data: any) => {
          const username = data.uniqueId || data.user?.displayId || data.user?.uniqueId || data.user?.nickname || 'unknown';
          const content = data.comment || data.content || '';
          const msgId = data.msgId || data.common?.msgId || Date.now().toString();
          
          console.log(`[TikTok] Chat parsed: @${username}: ${content}`);
          const payload = {
            type: 'chat',
            comment: {
              id: msgId,
              username: username,
              content: content,
              timestamp: Date.now(),
            }
          };
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
          } catch (e) {
            console.error('Failed to enqueue chat data', e);
            tiktokLiveConnection?.disconnect();
          }
        });

        // @ts-ignore
        tiktokLiveConnection.on('error', (err: any) => {
          console.error('TikTok Live Connection Error Event:', err);
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`));
          } catch (e) {}
        });

        // @ts-ignore
        tiktokLiveConnection.on('disconnected', () => {
          console.log('[TikTok] Disconnected event fired');
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'disconnected' })}\n\n`));
            controller.close();
          } catch (e) {}
        });

        // Connect
        console.log(`[TikTok] Attempting to connect to ${username}...`);
        await tiktokLiveConnection.connect();
        console.log(`[TikTok] Successfully connected to ${username}`);
        
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', username })}\n\n`));
          
          // INJECT TEST MESSAGE TO VERIFY PIPELINE
          setTimeout(() => {
            try {
              const testPayload = {
                type: 'chat',
                comment: {
                  id: 'sys_' + Date.now(),
                  username: 'system_test',
                  content: 'Terkoneksi! Menunggu komentar asli...',
                  timestamp: Date.now(),
                }
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(testPayload)}\n\n`));
            } catch (e) {}
          }, 2000);
          
        } catch (e) {
          tiktokLiveConnection.disconnect();
        }

        // Cleanup when client disconnects
        req.signal.addEventListener('abort', () => {
          tiktokLiveConnection?.disconnect();
        });

      } catch (err: unknown) {
        console.error('Failed to connect to TikTok Live:', err);
        try {
          const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`));
          controller.close();
        } catch (e) {}
      }
    },
    cancel() {
      // Stream cancelled by client
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
