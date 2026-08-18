import { TTSProvider, TTSOptions } from './index';

export class WebTTSProvider implements TTSProvider {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    // Check if running in browser
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Load voices immediately
      const loadVoices = () => {
        this.voices = this.synth.getVoices();
      };
      loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = loadVoices;
      }
      
      // Clear any stuck utterances from previous sessions
      this.synth.cancel();
    } else {
      this.synth = {} as SpeechSynthesis; // Mock for SSR
    }
  }

  private isStopped = false;

  async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!this.synth || !this.synth.speak) {
      console.warn('Web Speech API is not supported in this environment.');
      return Promise.resolve();
    }

    this.isStopped = false;
    this.stop(); // Stop any existing speech
    
    // Chunk text by sentences to prevent Chrome's SpeechSynthesisError for long texts (>250 chars)
    const chunks = text.match(/[^.!?]+[.!?]*/g) || [text];

    for (const chunk of chunks) {
      if (this.isStopped) break;
      const trimmed = chunk.trim();
      if (trimmed.length === 0) continue;
      await this.speakChunk(trimmed, options);
    }
  }

  private async speakChunk(text: string, options?: TTSOptions): Promise<void> {
    return new Promise((resolve, _reject) => {
      // Re-fetch voices just in case they loaded late
      if (this.voices.length === 0 && this.synth.getVoices) {
        this.voices = this.synth.getVoices();
      }

      this.currentUtterance = new SpeechSynthesisUtterance(text);

      // Try to find a matching voice if requested
      let selectedVoice: SpeechSynthesisVoice | undefined;
      
      if (options?.voiceId) {
        selectedVoice = this.voices.find(v => v.voiceURI === options.voiceId);
      }
      
      if (!selectedVoice && options?.language) {
        // Fallback to language matching
        selectedVoice = this.voices.find(v => v.lang.includes(options.language as string));
      }
      
      if (selectedVoice) {
        this.currentUtterance.voice = selectedVoice;
      }

      if (options?.pitch !== undefined) {
        this.currentUtterance.pitch = Number(options.pitch);
      }
      
      if (options?.speed !== undefined) {
        this.currentUtterance.rate = Number(options.speed);
      }

      this.currentUtterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      this.currentUtterance.onerror = (e) => {
        console.warn('SpeechSynthesisError on chunk:', e);
        this.currentUtterance = null;
        resolve(); // Resolve anyway to not break the queue
      };

      this.synth.speak(this.currentUtterance);
    });
  }

  stop(): void {
    this.isStopped = true;
    if (this.synth && this.synth.cancel) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  pause(): void {
    if (this.synth && this.synth.pause) {
      this.synth.pause();
    }
  }

  resume(): void {
    if (this.synth && this.synth.resume) {
      this.synth.resume();
    }
  }
}
