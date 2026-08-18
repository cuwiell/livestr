export interface AvatarProvider {
  /**
   * Initializes the avatar inside a container.
   * Useful for WebGL/Live2D setups.
   */
  initialize(containerId: string): Promise<void>;
  
  /**
   * Triggers speaking animation.
   * Can accept audio data/buffer for automatic lip-sync in complex providers.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  speak(audioData?: any): void;
  
  /**
   * Stops the speaking animation immediately.
   */
  stop(): void;
  
  /**
   * Sets the visual emotion of the avatar (e.g., 'happy', 'sad', 'angry').
   */
  setEmotion(emotion: string): void;
  
  /**
   * Sets a specific gesture (e.g., 'wave', 'nod').
   */
  setGesture(gesture: string): void;
  
  /**
   * Returns the avatar to a default breathing/idle state.
   */
  setIdle(): void;
  
  /**
   * Cleans up the avatar instance from memory.
   */
  destroy(): void;
}
