import { LiveProvider, LiveState, LiveComment } from '@/types/live';

export class RealTikTokProvider implements LiveProvider {
  private state: LiveState = 'IDLE';
  private onCommentCallback: ((c: Omit<LiveComment, 'priorityScore' | 'state'>) => void) | null = null;
  private eventSource: EventSource | null = null;
  private username: string;

  constructor(username: string) {
    this.username = username;
  }

  async connect(): Promise<void> {
    this.state = 'CONNECTING';
    
    return new Promise((resolve, reject) => {
      // Connect to our internal Next.js SSE proxy
      this.eventSource = new EventSource(`/api/tiktok/stream?username=${encodeURIComponent(this.username)}`);

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            this.state = 'LIVE';
            resolve();
          } else if (data.type === 'chat') {
            if (this.onCommentCallback) {
               this.onCommentCallback(data.comment);
            }
          } else if (data.type === 'error') {
            console.error('TikTok Provider Error:', data.message);
            if (this.state === 'CONNECTING') {
               this.state = 'ERROR';
               reject(new Error(data.message));
               this.disconnect();
            }
          } else if (data.type === 'disconnected') {
            this.disconnect();
          }
        } catch (e) {
          console.error('Error parsing SSE message', e);
        }
      };

      this.eventSource.onerror = (err) => {
        console.error('EventSource failed:', err);
        if (this.state === 'CONNECTING') {
           reject(new Error("Failed to establish SSE connection or Host is not Live"));
        }
        this.disconnect();
      };
    });
  }

  disconnect(): void {
    this.state = 'ENDED';
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  onComment(callback: (c: Omit<LiveComment, 'priorityScore' | 'state'>) => void): void {
    this.onCommentCallback = callback;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEvent(callback: (e: unknown) => void): void {
    // Future implementation for Gifts/Likes
  }

  getStatus(): LiveState {
    return this.state;
  }
}
