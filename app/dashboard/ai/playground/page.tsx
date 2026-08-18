'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { db } from '@/lib/firebase/client';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Host } from '@/types/host';
import { ChatHistoryItem } from '@/lib/ai/conversationEngine';
import { Send, Bot, User, Settings2 } from 'lucide-react';

export default function AIPlayground() {
  const { user } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [selectedHostId, setSelectedHostId] = useState<string>('');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<'mock' | 'openai'>('mock');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHosts = async () => {
      if (!user) return;
      const q = query(collection(db, 'hosts'), where('ownerId', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Host));
      setHosts(data);
      if (data.length > 0) setSelectedHostId(data[0].id!);
    };
    fetchHosts();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const selectedHost = hosts.find(h => h.id === selectedHostId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedHost) return;

    const userMessage = input.trim();
    setInput('');
    
    const newHistory: ChatHistoryItem[] = [
      ...history,
      { role: 'user', content: userMessage, timestamp: Date.now(), username: user?.displayName || 'Viewer' }
    ];
    setHistory(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: selectedHost,
          currentComment: userMessage,
          history: history, // Send previous history as context
          username: user?.displayName || 'Viewer',
          provider: provider
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setHistory(prev => [
          ...prev,
          { role: 'assistant', content: data.data.text, timestamp: Date.now() }
        ]);
      } else {
        throw new Error(data.error || 'Failed to generate response');
      }
    } catch (err: unknown) {
      setHistory(prev => [
        ...prev,
        { role: 'assistant', content: `[ERROR]: ${(err as Error).message}`, timestamp: Date.now() }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 p-6">
        <div>
          <h1 className="text-xl font-semibold text-white">AI Engine Playground</h1>
          <p className="text-sm text-neutral-400">Test your hosts&apos; personality and responses.</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-white"
            value={provider}
            onChange={(e) => setProvider(e.target.value as 'mock' | 'openai')}
          >
            <option value="mock">Mock Provider (Fast/Free)</option>
            <option value="openai">OpenAI (Requires API Key)</option>
          </select>
          <select
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-white"
            value={selectedHostId}
            onChange={(e) => {
              setSelectedHostId(e.target.value);
              setHistory([]); // clear history on host change
            }}
          >
            {hosts.length === 0 && <option value="">No hosts found</option>}
            {hosts.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </div>
      </div>

      {!selectedHost ? (
        <div className="flex flex-1 items-center justify-center text-neutral-500 flex-col gap-2">
          <Settings2 className="h-8 w-8" />
          <p>Create a host first to use the playground.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {history.length === 0 && (
              <div className="text-center text-sm text-neutral-500 mt-10">
                Send a message to start chatting with {selectedHost.name}.
              </div>
            )}
            
            {history.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${msg.role === 'user' ? 'bg-blue-600' : 'bg-neutral-700'}`}>
                  {msg.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                </div>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-200'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-700">
                  <Bot className="h-4 w-4 text-white animate-pulse" />
                </div>
                <div className="rounded-2xl bg-neutral-800 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce"></span>
                    <span className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce delay-75"></span>
                    <span className="h-2 w-2 rounded-full bg-neutral-500 animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="border-t border-neutral-800 p-4">
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                placeholder={`Chat with ${selectedHost.name}...`}
                className="w-full rounded-full border border-neutral-700 bg-neutral-800 py-3 pl-4 pr-12 text-sm text-white placeholder-neutral-500 focus:border-neutral-500 focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-neutral-200 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
