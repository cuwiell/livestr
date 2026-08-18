import React from 'react';
import { Bot } from 'lucide-react';
import clsx from 'clsx';

export type AvatarState = 'idle' | 'thinking' | 'speaking';
export type AvatarEmotion = 'neutral' | 'happy' | 'excited' | 'serious' | 'calm';

interface CSSAvatarProps {
  state: AvatarState;
  emotion?: AvatarEmotion;
  className?: string;
}

export function CSSAvatar({ state, emotion = 'neutral', className }: CSSAvatarProps) {
  
  // Base color logic based on state and emotion
  const getColors = () => {
    if (state === 'thinking') return 'border-yellow-500 text-yellow-500 shadow-yellow-500/20';
    if (state === 'speaking') {
      switch (emotion) {
        case 'excited': return 'border-red-500 text-red-500 shadow-red-500/40';
        case 'calm': return 'border-teal-400 text-teal-400 shadow-teal-400/30';
        case 'happy': return 'border-green-400 text-green-400 shadow-green-400/30';
        default: return 'border-blue-500 text-blue-500 shadow-blue-500/30'; // neutral/serious
      }
    }
    return 'border-neutral-600 text-neutral-500 shadow-transparent'; // idle
  };

  const getRingAnimation = () => {
    if (state === 'thinking') return 'animate-[spin_4s_linear_infinite] opacity-50';
    if (state === 'speaking') return 'animate-ping opacity-30';
    return 'opacity-0';
  };

  const colors = getColors();

  return (
    <div className={clsx("relative flex items-center justify-center", className)}>
      
      {/* Outer Ring Effect */}
      <div className={clsx(
        "absolute -inset-4 rounded-full border-2 transition-all duration-500",
        colors,
        getRingAnimation()
      )}></div>
      
      {/* Secondary Pulse for speaking */}
      {state === 'speaking' && (
        <div className={clsx(
          "absolute -inset-2 rounded-full bg-current opacity-10 animate-pulse transition-colors duration-300",
          colors.split(' ')[1] // Extract text-color to use as background
        )}></div>
      )}

      {/* Core Avatar Circle */}
      <div className={clsx(
        "relative flex h-32 w-32 items-center justify-center rounded-full bg-neutral-900 border-2 shadow-lg transition-all duration-300 z-10",
        colors,
        state === 'idle' && "animate-[pulse_4s_ease-in-out_infinite]" // Gentle breathing when idle
      )}>
        <Bot className={clsx(
          "h-12 w-12 transition-all duration-300",
          state === 'speaking' && "scale-110",
        )} />
      </div>

    </div>
  );
}
