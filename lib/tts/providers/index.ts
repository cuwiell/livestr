export interface TTSOptions {
  voiceId?: string;
  speed?: number;
  pitch?: number;
  emotion?: string;
  language?: string;
}

export interface TTSProvider {
  /**
   * Prepares and plays the audio for the given text.
   * Returns a promise that resolves when the audio finishes playing.
   */
  speak(text: string, options?: TTSOptions): Promise<void>;
  
  /**
   * Stops the current playback immediately.
   */
  stop(): void;

  /**
   * Pause the playback.
   */
  pause(): void;

  /**
   * Resume playback.
   */
  resume(): void;
}
