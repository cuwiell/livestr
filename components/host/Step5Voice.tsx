'use client';

import { useHostStore } from '@/hooks/useHostStore';
import clsx from 'clsx';
import { Mic2, Play, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Step5Voice() {
  const { hostData, updateNestedData } = useHostStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Filter primarily for the selected language, but show all if needed
      const sortedVoices = [...availableVoices].sort((a, b) => {
        // Prioritize native/Google/Microsoft voices and the host's language
        if (a.lang.includes(hostData.language) && !b.lang.includes(hostData.language)) return -1;
        if (!a.lang.includes(hostData.language) && b.lang.includes(hostData.language)) return 1;
        return a.name.localeCompare(b.name);
      });
      setVoices(sortedVoices);
      
      // Auto-select first matching voice if none selected
      if (sortedVoices.length > 0 && (!hostData.voice.voiceId || hostData.voice.voiceId.startsWith('mock'))) {
        updateNestedData('voice', { 
          voiceId: sortedVoices[0].voiceURI, 
          provider: 'web' 
        });
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [hostData.language, updateNestedData, hostData.voice.voiceId]);

  const testVoice = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance("Halo, ini adalah suara yang akan saya gunakan saat live stream nanti!");
    
    const selectedVoice = voices.find(v => v.voiceURI === hostData.voice.voiceId);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.pitch = hostData.voice.pitch;
    utterance.rate = hostData.voice.speed;
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-white">Voice Selection</h2>
          <p className="text-sm text-neutral-400">Pilih model suara AI bawaan perangkat Anda secara gratis.</p>
        </div>
        <button
          onClick={testVoice}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
            isPlaying ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          {isPlaying ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
          {isPlaying ? 'Stop Test' : 'Test Voice'}
        </button>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
        <label className="block text-sm font-medium text-neutral-300 mb-2">Available Voices (Browser Native)</label>
        {voices.length === 0 ? (
          <p className="text-sm text-yellow-500 p-3 bg-yellow-500/10 rounded-lg">Loading voices... (Jika tidak muncul, browser Anda mungkin tidak mendukung fitur ini).</p>
        ) : (
          <select
            value={hostData.voice.voiceId}
            onChange={(e) => updateNestedData('voice', { voiceId: e.target.value, provider: 'web' })}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white outline-none focus:border-purple-500"
          >
            {voices.map(voice => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name} ({voice.lang}) {voice.localService ? '' : '☁️'}
              </option>
            ))}
          </select>
        )}
        <p className="text-xs text-neutral-500 mt-2">
          Saran: Gunakan browser <strong>Microsoft Edge</strong> untuk mendapatkan suara "Microsoft Natural" atau <strong>Google Chrome</strong> untuk suara "Google Translate" yang terdengar seperti manusia asli.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium text-neutral-300">Pitch (Nada Suara)</label>
            <span className="text-xs text-neutral-500">{hostData.voice.pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={hostData.voice.pitch}
            onChange={(e) => updateNestedData('voice', { pitch: parseFloat(e.target.value) })}
            className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
          />
        </div>
        <div>
          <div className="mb-2 flex justify-between">
            <label className="text-sm font-medium text-neutral-300">Speed (Kecepatan)</label>
            <span className="text-xs text-neutral-500">{hostData.voice.speed.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={hostData.voice.speed}
            onChange={(e) => updateNestedData('voice', { speed: parseFloat(e.target.value) })}
            className="h-2 w-full appearance-none rounded-full bg-neutral-800 outline-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
}
