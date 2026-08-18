import { useState } from 'react';
import { useHostStore } from '@/hooks/useHostStore';
import clsx from 'clsx';
import { Sparkles, Link as LinkIcon, Loader2 } from 'lucide-react';

export function Step2Appearance() {
  const { hostData, updateData } = useHostStore();
  const [tab, setTab] = useState<'generate' | 'url'>('url');
  
  // URL Tab
  const [inputUrl, setInputUrl] = useState(hostData.avatarUrl || '');
  
  // Generate Tab
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleSaveUrl = () => {
    updateData({ avatarUrl: inputUrl, avatarType: 'url' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError('');

    try {
      const res = await fetch('/api/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        updateData({ avatarUrl: data.url, avatarType: 'dalle' });
        setInputUrl(data.url);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const isVideo = hostData.avatarUrl?.toLowerCase().endsWith('.mp4') || hostData.avatarUrl?.toLowerCase().endsWith('.webm');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-semibold text-white">Appearance</h2>
        <p className="text-sm text-neutral-400">Select a visual representation for your host (9:16 portrait format).</p>
      </div>

      <div className="flex gap-6">
        {/* Left Side: Controls */}
        <div className="flex-1 space-y-6">
          <div className="flex rounded-lg bg-neutral-900 p-1 border border-neutral-800">
            <button
              onClick={() => setTab('url')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition",
                tab === 'url' ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <LinkIcon className="w-4 h-4" /> Use Direct URL
            </button>
            <button
              onClick={() => setTab('generate')}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition",
                tab === 'generate' ? "bg-blue-600 text-white" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Sparkles className="w-4 h-4" /> AI Generator
            </button>
          </div>

          {tab === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Media URL (.jpg, .png, .mp4)</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (!e.target.value) updateData({ avatarUrl: '' });
                  }}
                  onBlur={() => {
                    if (inputUrl.startsWith('http')) {
                      updateData({ avatarUrl: inputUrl, avatarType: 'url' });
                    }
                  }}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none placeholder-neutral-600"
                />
                <p className="mt-2 text-xs text-neutral-500">Paste a direct link to an image or video.</p>
              </div>
              <button
                onClick={handleSaveUrl}
                disabled={!inputUrl}
                className="rounded-lg bg-white px-4 py-2 font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
              >
                Apply Media
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Describe Your Character</label>
                <textarea
                  placeholder="e.g. A cyberpunk ninja girl, neon lighting, anime style, highly detailed portrait..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-3 text-white focus:border-blue-500 focus:outline-none placeholder-neutral-600 resize-none"
                />
                <p className="mt-2 text-xs text-neutral-500">Powered by OpenAI DALL-E 3. Costs approx $0.04 per generation.</p>
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Preview */}
        <div className="w-64 shrink-0 flex flex-col items-center">
          <p className="text-sm font-medium text-neutral-400 mb-3">Live Studio Preview</p>
          <div className="relative w-full aspect-[9/16] rounded-2xl border-2 border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center shadow-xl">
            {hostData.avatarUrl ? (
              isVideo ? (
                <video src={hostData.avatarUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img 
                  src={hostData.avatarUrl} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x700?text=Invalid+Image+URL';
                  }}
                />
              )
            ) : (
              <div className="text-neutral-600 flex flex-col items-center gap-2">
                <div className="w-16 h-16 border-2 border-neutral-700 rounded-full border-dashed"></div>
                <span className="text-xs font-medium">No Media</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
