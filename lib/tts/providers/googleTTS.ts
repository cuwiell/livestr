import { TTSProvider, TTSOptions } from './index';

export class GoogleTTSProvider implements TTSProvider {
  private audio: HTMLAudioElement | null = null;
  private isStopped = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
    }
  }

  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.audio) return Promise.resolve();

    this.stop(); // Stop any existing speech
    this.isStopped = false;

    // Split text into 200-character chunks (Google Translate TTS limit)
    const chunks = text.match(/.{1,200}(?:\s|$)/g) || [text];

    for (const chunk of chunks) {
      if (this.isStopped) break;
      const trimmed = chunk.trim();
      if (trimmed.length === 0) continue;
      await this.speakChunk(trimmed, options);
    }
  }

  private async speakChunk(text: string, options?: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.audio) {
        resolve();
        return;
      }

      const lang = options?.language || 'id';
      // Use the unofficial free Google Translate TTS endpoint
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
      
      this.audio.src = url;
      this.audio.playbackRate = options?.speed ? Number(options.speed) : 1.0;
      
      this.audio.onended = () => {
        resolve();
      };

      this.audio.onerror = (e) => {
        console.warn('Google TTS Audio Error:', e);
        resolve(); // Resolve to not break the queue
      };

      this.audio.play().catch(err => {
        console.warn('Google TTS Playback blocked by browser:', err);
        resolve(); // Blocked by autoplay policy, resolve to not get stuck
      });
    });
  }

  stop(): void {
    this.isStopped = true;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio) {
      this.audio.play().catch(() => {});
    }
  }
}

