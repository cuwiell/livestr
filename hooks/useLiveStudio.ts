import { create } from 'zustand';
import { LiveState, LiveComment } from '@/types/live';
import { Host } from '@/types/host';
import { ChatHistoryItem } from '@/lib/ai/conversationEngine';

interface LiveStudioState {
  // Session State
  status: LiveState;
  host: Host | null;
  provider: 'mock' | 'openai';
  
  // UI & Queue Data
  comments: LiveComment[];
  chatHistory: ChatHistoryItem[];
  currentAiResponse: string | null;
  isAiThinking: boolean;
  isAiSpeaking: boolean;
  isTtsMuted: boolean;

  // Actions
  setHost: (host: Host) => void;
  setStatus: (status: LiveState) => void;
  setProvider: (provider: 'mock' | 'openai' | 'gemini') => void;
  
  addComment: (comment: LiveComment) => void;
  updateCommentState: (id: string, state: LiveComment['state']) => void;
  
  setAiResponse: (response: string | null) => void;
  setAiThinking: (isThinking: boolean) => void;
  setAiSpeaking: (isSpeaking: boolean) => void;
  setTtsMuted: (isMuted: boolean) => void;
  addHistoryItem: (item: ChatHistoryItem) => void;
  
  reset: () => void;
}

export const useLiveStudio = create<LiveStudioState>((set) => ({
  status: 'IDLE',
  host: null,
  provider: 'mock',
  comments: [],
  chatHistory: [],
  currentAiResponse: null,
  isAiThinking: false,
  isAiSpeaking: false,
  isTtsMuted: false,

  setHost: (host) => set({ host }),
  setStatus: (status) => set({ status }),
  setProvider: (provider) => set({ provider }),
  
  addComment: (comment) => set((state) => {
    // Prevent duplicate keys
    if (state.comments.some(c => c.id === comment.id)) return state;
    
    // Insert at the beginning so newest is at the top
    const newComments = [comment, ...state.comments];
    if (newComments.length > 100) newComments.pop(); // Remove oldest from the end
    return { comments: newComments };
  }),
  
  updateCommentState: (id, newState) => set((state) => ({
    comments: state.comments.map(c => c.id === id ? { ...c, state: newState } : c)
  })),

  setAiResponse: (response) => set({ currentAiResponse: response }),
  setAiThinking: (isThinking) => set({ isAiThinking: isThinking }),
  setAiSpeaking: (isSpeaking) => set({ isAiSpeaking: isSpeaking }),
  setTtsMuted: (isMuted) => set({ isTtsMuted: isMuted }),
  
  addHistoryItem: (item) => set((state) => {
    const newHistory = [...state.chatHistory, item];
    if (newHistory.length > 50) newHistory.shift(); // Keep history size manageable
    return { chatHistory: newHistory };
  }),

  reset: () => set({
    status: 'IDLE',
    comments: [],
    chatHistory: [],
    currentAiResponse: null,
    isAiThinking: false,
    isAiSpeaking: false,
  })
}));
