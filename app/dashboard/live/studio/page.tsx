'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Host } from '@/types/host';
import { useLiveStudio } from '@/hooks/useLiveStudio';
import { CommentQueue } from '@/lib/live/commentQueue';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { GeminiProvider } from '@/lib/ai/providers/gemini';
import { MockTikTokProvider } from '@/lib/live/providers/mockTikTok';
import { RealTikTokProvider } from '@/lib/live/providers/realTikTok';
import { WebTTSProvider } from '@/lib/tts/providers/webTTS';
import { GoogleTTSProvider } from '@/lib/tts/providers/googleTTS';
import { LiveProvider } from '@/types/live';
import { AudioQueue } from '@/lib/tts/audioQueue';
import { Settings2, Square, Radio, Volume2, VolumeX, Gift } from 'lucide-react';
import clsx from 'clsx';
import { Canvas } from '@react-three/fiber';
import { Environment, ContactShadows, Html, useProgress } from '@react-three/drei';
import { AvatarModel } from '@/components/live/Avatar3D';
import { ErrorBoundary } from '@/components/live/ErrorBoundary';
import React, { Suspense } from 'react';

function Loader() {
  const { progress } = useProgress();
  return <Html center className="text-white text-sm font-medium whitespace-nowrap">Loading 3D... {progress.toFixed(0)}%</Html>;
}

export default function LiveStudio() {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  
  // Local Setup State
  const [liveSource, setLiveSource] = useState<'mock' | 'tiktok'>('mock');
  const [tiktokUsername, setTiktokUsername] = useState<string>('');
  const [setupError, setSetupError] = useState<string>('');
  
  const {
    status, host, provider, comments, chatHistory, currentAiResponse, isAiThinking, isAiSpeaking, isTtsMuted,
    setHost, setStatus, setProvider, addComment, updateCommentState,
    setAiResponse, setAiThinking, setAiSpeaking, setTtsMuted, addHistoryItem, reset
  } = useLiveStudio();

  // PNGTuber flapping state
  const [isMouthOpen, setIsMouthOpen] = useState(false);

  // Keep instances in refs so they persist across renders
  const queueRef = useRef(new CommentQueue(20));
  const providerRef = useRef<LiveProvider | null>(null);
  const audioQueueRef = useRef<AudioQueue | null>(null);
  const loopRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Hosts on mount
  useEffect(() => {
    if (!user) return;
    const fetchHosts = async () => {
      try {
        const q = query(collection(db, 'hosts'), where('ownerId', '==', user.uid));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Host));
        
        if (data.length > 0) {
          setHosts(data);
          setSelectedHostId(data[0].id!);
        } else {
          throw new Error("No hosts found"); // Trigger catch block to use mock
        }
      } catch (err) {
        console.warn("Bypassing Firebase Firestore, using Mock Host:", err);
        const mockHost: Host = {
          id: 'mock-host-1',
          name: 'Tori (Mock)',
          description: 'A mock host for UI testing',
          gender: 'Female',
          age: '20',
          language: 'id-ID',
          avatarType: '2d',
          avatarUrl: '',
          personality: { friendly: 8, funny: 6, energetic: 7, calm: 5, curious: 8, playful: 7, serious: 2, sarcastic: 1 },
          speakingStyle: { responseLength: 'medium', formality: 'casual', energyLevel: 7, humorLevel: 6, emotion: 'excited' },
          voice: { provider: 'web', voiceId: 'default', pitch: 1, speed: 1 },
          behavior: { responseCooldownMs: 2000, allowedTopics: [], forbiddenTopics: [] },
          status: 'active'
        };
        setHosts([mockHost]);
        setSelectedHostId(mockHost.id!);
      }
    };
    fetchHosts();
    
    return () => {
      // Cleanup on unmount
      if (providerRef.current) providerRef.current.disconnect();
      if (audioQueueRef.current) audioQueueRef.current.clear();
      if (loopRef.current) clearInterval(loopRef.current);
      reset();
    };
  }, [user, reset]);

  // 1.5. PNGTuber Flapping Effect
  useEffect(() => {
    let flapInterval: NodeJS.Timeout;
    if (isAiSpeaking && host?.avatarUrlSpeaking) {
      flapInterval = setInterval(() => {
        setIsMouthOpen(prev => !prev);
      }, 150 + Math.random() * 50); // Randomize slightly for natural look
    } else {
      setIsMouthOpen(false);
    }
    return () => clearInterval(flapInterval);
  }, [isAiSpeaking, host?.avatarUrlSpeaking]);

  const lastProcessTimeRef = useRef<number>(0);

  // 2. The Main AI Loop (Processing the queue)
  useEffect(() => {
    if (status !== 'LIVE') {
      if (loopRef.current) clearInterval(loopRef.current);
      return;
    }

    const processNextComment = async () => {
      // Wait if AI is busy thinking or currently speaking audio
      if (isAiThinking || isAiSpeaking) return; 
      
      // Enforce a minimum 5-second cooldown between AI requests to prevent Free Tier Rate Limits
      const now = Date.now();
      if (now - lastProcessTimeRef.current < 5000) return;

      const next = queueRef.current.getNextComment();
      if (!next) return; // Queue empty

      lastProcessTimeRef.current = now;
      updateCommentState(next.id, 'processing');
      setAiThinking(true);

      try {
        const res = await fetch('/api/ai/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            host: host,
            currentComment: next.content,
            history: chatHistory,
            username: next.username,
            provider: provider
          }),
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          queueRef.current.markState(next.id, 'answered');
          updateCommentState(next.id, 'answered');
          
          setAiResponse(data.data.text);
          setAiThinking(false);
          
          addHistoryItem({ role: 'user', content: next.content, timestamp: Date.now(), username: next.username });
          addHistoryItem({ role: 'assistant', content: data.data.text, timestamp: Date.now() });

          // Push text to Audio Queue for TTS playback
          if (audioQueueRef.current) {
            audioQueueRef.current.add(next.id, data.data.text, {
              voiceId: host?.voice.voiceId,
              language: host?.language,
              speed: host?.voice.speed || 1.0,
              pitch: host?.voice.pitch || 1.0,
            });
          }

        } else {
          throw new Error(data.error);
        }
      } catch (err: unknown) {
        console.error('AI Error:', err);
        const errMsg = err instanceof Error ? err.message : 'Unknown error';
        queueRef.current.markState(next.id, 'skipped');
        updateCommentState(next.id, 'skipped');
        
        // Show error to user so they know why it failed
        const isQuotaError = errMsg.toLowerCase().includes('quota') || errMsg.includes('429') || errMsg.includes('insufficient');
        const friendlyError = isQuotaError 
          ? "Maaf, API Key AI Anda kehabisan limit penggunaan gratis. Mohon tunggu beberapa detik."
          : `Sistem AI bermasalah: ${errMsg.slice(0, 50)}`;
          
        setAiResponse(friendlyError);
        setAiThinking(false);
        
        // Push 10s penalty cooldown to prevent spamming blocked API
        lastProcessTimeRef.current = Date.now() + 10000;
        
        // Let the host say the error
        if (audioQueueRef.current) {
          audioQueueRef.current.add(next.id + '_err', friendlyError, {
            voiceId: host?.voice.voiceId,
            language: host?.language,
            speed: host?.voice.speed || 1.0,
            pitch: host?.voice.pitch || 1.0,
          });
        }
      }
    };

    loopRef.current = setInterval(processNextComment, 1000);
    
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, [status, isAiThinking, isAiSpeaking, host, provider, chatHistory, setAiThinking, updateCommentState, setAiResponse, addHistoryItem]);


  // 3. Start Live Session
  const handleStartLive = async () => {
    setSetupError('');
    if (liveSource === 'tiktok' && !tiktokUsername.trim()) {
      setSetupError('TikTok Username is required for Real TikTok Source');
      return;
    }

    const selected = hosts.find(h => h.id === selectedHostId);
    if (!selected) return;
    
    setHost(selected);
    reset(); // Clear previous session data
    
    // Hack: Unlock Web Speech API immediately during the click event
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const unlockMsg = new SpeechSynthesisUtterance(' ');
      unlockMsg.volume = 0;
      window.speechSynthesis.speak(unlockMsg);
    }
    
    queueRef.current = new CommentQueue(20);
    
    if (liveSource === 'tiktok') {
      providerRef.current = new RealTikTokProvider(tiktokUsername.trim());
    } else {
      providerRef.current = new MockTikTokProvider();
    }
    
    // Setup Audio Queue using selected provider
    const ttsProvider = selected.voice.provider === 'googleTTS' 
      ? new GoogleTTSProvider() 
      : new WebTTSProvider();
      
    audioQueueRef.current = new AudioQueue(ttsProvider);
    audioQueueRef.current.setCallbacks(
      (id, text) => {
        setAiResponse(text);
        setAiSpeaking(true);
      },
      (_id) => {
        setAiResponse(null);
        setAiSpeaking(false);
      }
    );
    audioQueueRef.current.setMuted(isTtsMuted);
    
    // Attach listener
    providerRef.current.onComment((raw) => {
      queueRef.current.addComment(raw);
      // Sync the exact queue to UI
      const currentQueue = queueRef.current.getQueue();
      // To prevent UI lag, we just take the newest one and sync state manually in a real app,
      // but for MVP we can just dispatch the latest added to zustand
      const newest = currentQueue[currentQueue.length - 1];
      if (newest && newest.id === raw.id) {
         addComment(newest);
      }
    });

    setStatus('CONNECTING');
    try {
      await providerRef.current.connect();
      setStatus('LIVE');
    } catch (err: unknown) {
      console.error(err);
      setStatus('ERROR');
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to Live Stream';
      setSetupError(errorMessage);
      setTimeout(() => {
         setStatus('IDLE');
      }, 3000);
    }
  };

  const handleEndLive = () => {
    if (providerRef.current) {
      providerRef.current.disconnect();
    }
    if (audioQueueRef.current) {
      audioQueueRef.current.clear();
    }
    setStatus('ENDED');
    setAiResponse(null);
    setAiThinking(false);
    setAiSpeaking(false);
  };

  const toggleMute = () => {
    const newMuted = !isTtsMuted;
    setTtsMuted(newMuted);
    if (audioQueueRef.current) {
      audioQueueRef.current.setMuted(newMuted);
    }
  };

  if (hosts.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40">
        <div className="text-center text-neutral-500">
          <Settings2 className="mx-auto h-8 w-8 mb-2" />
          <p>Please create a Host first in the Host Manager.</p>
        </div>
      </div>
    );
  }

  // Pre-live Setup Screen
  if (status === 'IDLE' || status === 'ENDED') {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Live Studio Setup</h1>
            <p className="text-neutral-400 mt-2">Configure your live session before going live.</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Select Host</label>
              <select
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none"
                value={selectedHostId}
                onChange={(e) => setSelectedHostId(e.target.value)}
              >
                {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">AI Provider</label>
              <select
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none"
                value={provider}
                onChange={(e) => setProvider(e.target.value as 'mock' | 'openai' | 'gemini')}
              >
                <option value="mock">Mock Provider (Fast/Testing)</option>
                <option value="openai">OpenAI (Butuh API Key & Saldo)</option>
                <option value="gemini">Google Gemini (Gratis 100%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Live Source</label>
              <select
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none"
                value={liveSource}
                onChange={(e) => setLiveSource(e.target.value as 'mock' | 'tiktok')}
              >
                <option value="mock">Mock Simulator (Testing)</option>
                <option value="tiktok">Real TikTok Live</option>
              </select>
            </div>

            {liveSource === 'tiktok' && (
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">TikTok Username (Target)</label>
                <input
                  type="text"
                  placeholder="@username"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none placeholder-neutral-500"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value.replace('@', ''))}
                />
                <p className="text-xs text-neutral-500 mt-1">Enter a public TikTok username that is currently streaming live.</p>
              </div>
            )}

            {setupError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {setupError}
              </div>
            )}

            <button
              onClick={handleStartLive}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 font-semibold text-white transition hover:bg-blue-700"
            >
              <Radio className="h-5 w-5" /> GO LIVE
            </button>
            {status === 'ENDED' && <p className="text-center text-sm text-green-500">Live session ended successfully.</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/50 p-4 glass-panel z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-medium text-red-500 border border-red-500/20">
              <span className={`h-2 w-2 rounded-full bg-red-500 ${status === 'LIVE' ? 'animate-pulse' : ''}`}></span>
              {status}
            </div>
            <span className="text-neutral-400 text-sm">Host: {host?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 transition hover:bg-neutral-700"
              title={isTtsMuted ? "Unmute TTS" : "Mute TTS"}
            >
              {isTtsMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              onClick={handleEndLive}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <Square className="h-4 w-4" /> End Live
            </button>
          </div>
        </div>

        {/* Avatar Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center py-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-neutral-950 relative overflow-hidden">
          
          <div className={clsx(
            "relative h-full max-h-[calc(100vh-14rem)] aspect-[9/16] w-auto rounded-3xl overflow-hidden shadow-2xl transition-all duration-500",
            isAiThinking ? "border-4 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]" :
            isAiSpeaking ? "border-4 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.4)] scale-[1.02]" :
            "border-4 border-neutral-700 shadow-xl"
          )}>
            {host?.avatarUrl ? (
              host.avatarType === '3d' || host.avatarUrl.toLowerCase().endsWith('.glb') ? (
                <ErrorBoundary>
                  <Canvas camera={{ position: [0, 0, 5], fov: 40 }} className="w-full h-full bg-gradient-to-b from-neutral-800 to-neutral-950">
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[-5, 5, 5]} intensity={1.5} />
                    <Suspense fallback={<Loader />}>
                      <AvatarModel url={host.avatarUrl} isSpeaking={isAiSpeaking} />
                    </Suspense>
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
                    <Environment preset="city" />
                  </Canvas>
                </ErrorBoundary>
              ) : (host.avatarUrl.toLowerCase().endsWith('.mp4') || host.avatarUrl.toLowerCase().endsWith('.webm')) ? (
                <video src={host.avatarUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={(isMouthOpen && host.avatarUrlSpeaking) ? host.avatarUrlSpeaking : host.avatarUrl} 
                  alt="Host Avatar" 
                  className={clsx("w-full h-full object-cover transition-transform duration-300", isAiSpeaking && !host.avatarUrlSpeaking && "scale-105")} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x700?text=Invalid+Image+URL';
                  }}
                />
              )
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-600">
                <span>No Media Configured</span>
              </div>
            )}

            {/* Status Overlay Badge */}
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
              <span className={clsx(
                "w-2 h-2 rounded-full",
                isAiThinking ? "bg-yellow-500 animate-pulse" :
                isAiSpeaking ? "bg-blue-500 animate-ping" :
                "bg-neutral-500"
              )}></span>
              <span className="text-xs font-medium text-white uppercase tracking-wider">
                {isAiThinking ? 'Thinking' : isAiSpeaking ? 'Speaking' : 'Idle'}
              </span>
            </div>
          </div>

        </div>

        {/* Left Sidebar - Stream Info & Config */}
        <div className="w-80 border-r border-neutral-800 glass-panel flex flex-col z-10">
          <div className="p-4 border-b border-neutral-800/50 bg-black/20">
            <h2 className="font-semibold text-neutral-200">Stream Config</h2>
          </div>
        </div>

        {/* AI Response Text Box */}
        <div className="border-t border-neutral-800 bg-neutral-900 p-6 min-h-[150px]">
          <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">AI Response</h3>
          {currentAiResponse ? (
            <p className="text-lg text-white leading-relaxed">{currentAiResponse}</p>
          ) : (
            <p className="text-lg text-neutral-600 italic">Waiting for comments...</p>
          )}
        </div>
      </div>

      {/* Right Sidebar - Comment Feed */}
      <div className="w-80 border-l border-neutral-800 glass-panel flex flex-col z-10">
        <div className="p-4 border-b border-neutral-800/50 bg-black/20 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white">Live Comments</h3>
          <span className="text-xs text-neutral-400">{comments.length} received</span>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {comments.map((comment, index) => (
            <div 
              key={comment.id}
              className={`py-1.5 px-3 text-[14px] leading-relaxed transition-colors animate-slide-up ${
                comment.isGift ? 'bg-pink-500/20 rounded-xl my-1 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.15)]' :
                comment.state === 'answered' ? 'bg-green-500/10 rounded-lg' :
                comment.state === 'processing' ? 'bg-yellow-500/10 rounded-lg' :
                comment.state === 'skipped' ? 'opacity-50' :
                (comment.priorityScore > 2) ? 'bg-blue-500/10 rounded-lg' :
                'bg-transparent'
              }`}
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <div className="inline-block w-full">
                <span 
                  className={`font-semibold mr-2 drop-shadow-sm ${comment.isGift ? 'text-pink-300' : 'text-neutral-300'}`}
                >
                  {comment.username}
                </span>
                
                {comment.isGift && (
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white font-bold px-1.5 py-0.5 rounded-full bg-pink-500 mr-2 align-middle">
                    <Gift className="w-3 h-3" /> GIFT
                  </span>
                )}
                
                <span 
                  className={`break-words ${comment.isGift ? 'font-bold text-pink-100' : 'text-white'}`} 
                  style={{ textShadow: '0px 1px 2px rgba(0,0,0,0.8)' }}
                >
                  {comment.content}
                </span>

                {/* Status Badges - Float right or inline end */}
                <span className="inline-flex ml-2 align-middle gap-1 opacity-70">
                  {comment.priorityScore > 0 && !comment.isGift && (
                    <span className="text-[10px] text-orange-400">★{comment.priorityScore}</span>
                  )}
                  {comment.state !== 'pending' && (
                    <span className={`text-[10px] uppercase tracking-wider ${
                      comment.state === 'processing' ? 'text-yellow-400' :
                      comment.state === 'answered' ? 'text-green-400' : 'text-neutral-500'
                    }`}>
                      • {comment.state}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
             <div className="text-center text-neutral-500 mt-10">No comments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
