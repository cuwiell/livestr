'use client';

import { useEffect, useState } from 'react';
import { Settings, Database, BrainCircuit, CheckCircle2, XCircle, Loader2, AlertTriangle, Cloud, GitBranch, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const [status, setStatus] = useState({
    hasFirebaseKey: false,
    hasOpenAIKey: false,
    loading: true
  });
  const [saving, setSaving] = useState(false);
  const [openAiKeyInput, setOpenAiKeyInput] = useState('');
  
  // Firebase Inputs
  const [fbConfig, setFbConfig] = useState({
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  });

  const router = useRouter();

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/settings/env');
      const data = await res.json();
      setStatus({
        hasFirebaseKey: data.hasFirebaseKey,
        hasOpenAIKey: data.hasOpenAIKey,
        loading: false
      });
    } catch (e) {
      console.error(e);
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSaveFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firebaseConfig: fbConfig })
    });
    setSaving(false);
    fetchStatus();
    alert('Firebase Config saved! You must restart the Next.js server (npm run dev) for this to take effect.');
  };

  const handleSaveOpenAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/settings/env', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ openaiKey: openAiKeyInput })
    });
    setSaving(false);
    fetchStatus();
    setOpenAiKeyInput('');
    alert('OpenAI Key saved! Next.js will reload it automatically.');
  };

  if (status.loading) return <div className="p-8 text-neutral-400 flex items-center gap-2"><Loader2 className="animate-spin h-5 w-5" /> Checking connections...</div>;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" />
          System Settings & Connections
        </h1>
        <p className="mt-2 text-neutral-400">Manage your external API connections and configurations required for the application to function.</p>
      </div>

      {(!status.hasFirebaseKey || !status.hasOpenAIKey) && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500 mt-1">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-red-500 font-bold text-lg mb-1">Peringatan: Konfigurasi Belum Lengkap!</h3>
            <p className="text-red-400/90 text-sm mb-2">Aplikasi Anda belum bisa berfungsi dengan baik. Harap ikuti petunjuk di bawah ini untuk menghubungkan:</p>
            <ul className="list-disc list-inside text-sm text-red-400 space-y-1">
              {!status.hasFirebaseKey && <li><strong>Firebase:</strong> Wajib untuk database Host dan Autentikasi.</li>}
              {!status.hasOpenAIKey && <li><strong>OpenAI:</strong> Wajib untuk otak dari AI Host.</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        
        {/* Firebase Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 glass-panel relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${status.hasFirebaseKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${status.hasFirebaseKey ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Firebase Connection</h2>
                <p className="text-sm text-neutral-400">Required for Authentication & Host Database.</p>
              </div>
            </div>
            {status.hasFirebaseKey ? (
              <span className="flex items-center gap-2 text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-4 w-4" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                <XCircle className="h-4 w-4" /> Missing
              </span>
            )}
          </div>

          {!status.hasFirebaseKey && (
            <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">How to connect:</h3>
              <ol className="list-decimal list-inside text-sm text-neutral-300 space-y-2 mb-6">
                <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Firebase Console</a> and create a new project.</li>
                <li>Add a Web App to get your configuration object.</li>
                <li>Enable **Authentication** (Email/Password) and **Firestore Database** (Test mode).</li>
                <li>Paste the config values below to automatically inject them into your `.env.local` file.</li>
              </ol>
              
              <form onSubmit={handleSaveFirebase} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="apiKey" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.apiKey} onChange={e => setFbConfig({...fbConfig, apiKey: e.target.value})} />
                <input required placeholder="authDomain" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.authDomain} onChange={e => setFbConfig({...fbConfig, authDomain: e.target.value})} />
                <input required placeholder="projectId" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.projectId} onChange={e => setFbConfig({...fbConfig, projectId: e.target.value})} />
                <input required placeholder="storageBucket" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.storageBucket} onChange={e => setFbConfig({...fbConfig, storageBucket: e.target.value})} />
                <input required placeholder="messagingSenderId" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.messagingSenderId} onChange={e => setFbConfig({...fbConfig, messagingSenderId: e.target.value})} />
                <input required placeholder="appId" className="p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={fbConfig.appId} onChange={e => setFbConfig({...fbConfig, appId: e.target.value})} />
                <button disabled={saving} type="submit" className="md:col-span-2 p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                  {saving ? 'Saving to .env.local...' : 'Save Firebase Config'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* OpenAI Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 glass-panel relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${status.hasOpenAIKey ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${status.hasOpenAIKey ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">OpenAI Connection</h2>
                <p className="text-sm text-neutral-400">Required for generating intelligent AI Host responses.</p>
              </div>
            </div>
            {status.hasOpenAIKey ? (
              <span className="flex items-center gap-2 text-sm font-medium text-green-500 bg-green-500/10 px-3 py-1 rounded-full">
                <CheckCircle2 className="h-4 w-4" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm font-medium text-red-500 bg-red-500/10 px-3 py-1 rounded-full">
                <XCircle className="h-4 w-4" /> Missing
              </span>
            )}
          </div>

          {!status.hasOpenAIKey && (
            <div className="mt-4 p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">How to connect:</h3>
              <p className="text-sm text-neutral-300 mb-4">You can still use the "Mock Provider" for testing, but to use real AI, you need an OpenAI API Key starting with <code className="bg-neutral-900 px-1 rounded text-pink-400">sk-...</code>.</p>
              <form onSubmit={handleSaveOpenAI} className="flex gap-4">
                <input required type="password" placeholder="sk-..." className="flex-1 p-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white" value={openAiKeyInput} onChange={e => setOpenAiKeyInput(e.target.value)} />
                <button disabled={saving} type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                  Save Key
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Vercel Deployment Card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 glass-panel relative overflow-hidden mt-6">
          <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                <Cloud className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vercel Deployment Guide</h2>
                <p className="text-sm text-neutral-400">How to publish your AI Live Host to the internet.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-800">
              <div className="text-neutral-500"><GitBranch className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-white mb-1">1. Push to GitHub</h3>
                <p className="text-sm text-neutral-400 mb-2">You must first upload your local code to a GitHub repository.</p>
                <div className="bg-black/50 p-3 rounded-lg border border-neutral-800 font-mono text-xs text-neutral-300">
                  <div className="flex items-center gap-2 mb-1"><Terminal className="h-3 w-3" /> <code>git init</code></div>
                  <div className="flex items-center gap-2 mb-1"><Terminal className="h-3 w-3" /> <code>git add .</code></div>
                  <div className="flex items-center gap-2 mb-1"><Terminal className="h-3 w-3" /> <code>git commit -m "Initial commit"</code></div>
                  <div className="flex items-center gap-2"><Terminal className="h-3 w-3" /> <code>git push origin main</code></div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-800">
              <div className="text-neutral-500"><Cloud className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-white mb-1">2. Import to Vercel</h3>
                <p className="text-sm text-neutral-400 mb-2">Go to <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Vercel Dashboard</a> and import your GitHub repository.</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl bg-neutral-800/30 border border-neutral-800">
              <div className="text-neutral-500"><Settings className="h-5 w-5" /></div>
              <div>
                <h3 className="font-semibold text-white mb-1">3. Environment Variables (CRITICAL)</h3>
                <p className="text-sm text-neutral-400 mb-3">Before clicking "Deploy", you MUST copy these exact keys from your local <code>.env.local</code> file into the Vercel Environment Variables section.</p>
                <ul className="list-disc list-inside text-sm text-neutral-300 bg-black/50 p-3 rounded-lg border border-neutral-800 space-y-1 font-mono">
                  <li>OPENAI_API_KEY</li>
                  <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
                  <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
                  <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
                  <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
                  <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
                </ul>
                <p className="text-xs text-orange-400 mt-3 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Without these variables, your Vercel app will crash on startup!
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
