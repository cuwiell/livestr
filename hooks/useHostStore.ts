import { create } from 'zustand';
import { Host } from '@/types/host';

export const defaultHostData: Host = {
  name: '',
  description: '',
  gender: '',
  age: '',
  language: 'id-ID',
  avatarType: '2D',
  avatarUrl: '',
  personality: {
    friendly: 0.8,
    funny: 0.5,
    energetic: 0.5,
    calm: 0.5,
    curious: 0.5,
    playful: 0.5,
    serious: 0.2,
    sarcastic: 0.1,
  },
  speakingStyle: {
    responseLength: 'short',
    formality: 'casual',
    energyLevel: 0.5,
    humorLevel: 0.5,
    emotion: 'happy',
  },
  voice: {
    provider: 'mock',
    voiceId: 'mock-1',
    pitch: 1.0,
    speed: 1.0,
  },
  behavior: {
    responseCooldownMs: 2000,
    allowedTopics: [],
    forbiddenTopics: [],
  },
  status: 'active',
};

interface HostStore {
  currentStep: number;
  hostData: Host;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<Host>) => void;
  updateNestedData: (category: keyof Host, data: Record<string, unknown>) => void;
  reset: () => void;
}

export const useHostStore = create<HostStore>((set) => ({
  currentStep: 1,
  hostData: { ...defaultHostData },
  
  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
  
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  
  updateData: (data) => set((state) => ({ hostData: { ...state.hostData, ...data } })),
  
  updateNestedData: (category, data) => set((state) => ({
    hostData: {
      ...state.hostData,
      [category]: {
        ...(state.hostData[category] as unknown as Record<string, unknown>),
        ...data
      }
    }
  })),
  
  reset: () => set({ currentStep: 1, hostData: { ...defaultHostData } }),
}));
