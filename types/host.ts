export interface HostPersonality {
  friendly: number;
  funny: number;
  energetic: number;
  calm: number;
  curious: number;
  playful: number;
  serious: number;
  sarcastic: number;
}

export interface HostSpeakingStyle {
  responseLength: 'short' | 'medium' | 'long';
  formality: 'formal' | 'casual' | 'very_casual';
  energyLevel: number;
  humorLevel: number;
  emotion: string;
}

export interface HostVoice {
  provider: string;
  voiceId: string;
  pitch: number;
  speed: number;
}

export interface HostBehavior {
  responseCooldownMs: number;
  allowedTopics: string[];
  forbiddenTopics: string[];
}

export interface Host {
  id?: string;
  ownerId?: string;
  name: string;
  description: string;
  gender: string;
  age: string;
  language: string;
  
  avatarUrl: string;
  avatarUrlSpeaking?: string; // For PNGTuber style (mouth open)
  avatarType: 'css' | 'url' | 'dalle' | '3d';
  
  personality: HostPersonality;
  speakingStyle: HostSpeakingStyle;
  voice: HostVoice;
  behavior: HostBehavior;
  
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
