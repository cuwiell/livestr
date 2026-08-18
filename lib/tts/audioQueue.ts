import { TTSProvider, TTSOptions } from './providers';

interface QueueItem {
  id: string;
  text: string;
  options?: TTSOptions;
}

export class AudioQueue {
  private provider: TTSProvider;
  private queue: QueueItem[] = [];
  private isPlaying: boolean = false;
  private onStartCallback: ((id: string, text: string) => void) | null = null;
  private onEndCallback: ((id: string) => void) | null = null;
  private isMuted: boolean = false;

  constructor(provider: TTSProvider) {
    this.provider = provider;
  }

  setCallbacks(onStart: (id: string, text: string) => void, onEnd: (id: string) => void) {
    this.onStartCallback = onStart;
    this.onEndCallback = onEnd;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.isPlaying) {
      this.provider.stop();
      // We don't clear the queue so it can continue processing (skipping playback)
    }
  }

  add(id: string, text: string, options?: TTSOptions) {
    this.queue.push({ id, text, options });
    this.processQueue();
  }

  private async processQueue() {
    if (this.isPlaying || this.queue.length === 0) return;

    this.isPlaying = true;
    const item = this.queue.shift()!;

    if (this.onStartCallback) {
      this.onStartCallback(item.id, item.text);
    }

    if (!this.isMuted) {
      try {
        const startTime = Date.now();
        await this.provider.speak(item.text, item.options);
        
        // If TTS resolved instantly (under 200ms), it means the browser blocked or failed the audio.
        // We must artificially delay it so the text remains readable on the screen.
        const elapsed = Date.now() - startTime;
        if (elapsed < 200) {
          const delay = Math.max(2000, item.text.length * 50);
          await new Promise(r => setTimeout(r, delay));
        }
      } catch (err) {
        console.error('TTS playback error:', err);
      }
    } else {
      // Simulate playback time if muted, so UI still shows text for a bit
      const delay = Math.max(2000, item.text.length * 50);
      await new Promise(r => setTimeout(r, delay));
    }

    if (this.onEndCallback) {
      this.onEndCallback(item.id);
    }

    this.isPlaying = false;
    this.processQueue(); // Process next item if exists
  }

  clear() {
    this.queue = [];
    this.provider.stop();
    this.isPlaying = false;
  }
}
