import { LiveProvider, LiveState, LiveComment } from '@/types/live';

const MOCK_COMMENTS = [
  "Halo!",
  "Lagi ngapain kak?",
  "Tori kamu tinggal dimana?",
  "Nyanyi dong!",
  "Aku suka banget sama stream ini",
  "Wkwkwk lucu banget",
  "Semangat live-nya!",
  "Berapa umur kamu?",
  "Salam kenal dari Bandung",
  "Coba sebut namaku dong @Tori",
];

const MOCK_USERS = ["Budi", "Andi", "Sinta", "Joko", "Rina", "User99", "GamerX"];

export class MockTikTokProvider implements LiveProvider {
  private state: LiveState = 'IDLE';
  private commentInterval: NodeJS.Timeout | null = null;
  private onCommentCallback: ((c: Omit<LiveComment, 'priorityScore' | 'state'>) => void) | null = null;
  private commentCount = 0;

  async connect(): Promise<void> {
    this.state = 'CONNECTING';
    return new Promise((resolve) => {
      setTimeout(() => {
        this.state = 'LIVE';
        this.startMockStream();
        resolve();
      }, 1500); // Simulate network delay
    });
  }

  disconnect(): void {
    this.state = 'ENDED';
    if (this.commentInterval) {
      clearInterval(this.commentInterval);
    }
  }

  onComment(callback: (c: Omit<LiveComment, 'priorityScore' | 'state'>) => void): void {
    this.onCommentCallback = callback;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEvent(callback: (e: unknown) => void): void {
    // Mock events like gifts, joins (can be added later)
  }

  getStatus(): LiveState {
    return this.state;
  }

  private startMockStream() {
    // Generate a random comment every 2 to 5 seconds
    const emitComment = () => {
      if (this.state !== 'LIVE') return;

      if (this.onCommentCallback) {
        const text = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];
        const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
        
        this.onCommentCallback({
          id: `mock-${this.commentCount++}-${Date.now()}`,
          username: user,
          content: text,
          timestamp: Date.now(),
        });
      }

      // Schedule next comment
      const nextDelay = Math.random() * 3000 + 2000;
      this.commentInterval = setTimeout(emitComment, nextDelay);
    };

    emitComment();
  }
}
