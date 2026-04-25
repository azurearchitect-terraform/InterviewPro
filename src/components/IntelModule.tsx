/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Globe, ShieldCheck, Zap, Info, RefreshCw, Layers, Building2, ArrowLeft, AlertCircle } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface IntelModuleProps {
  state: AppState;
  apiKey: string;
  onUpdateIntel: (intel: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function IntelModule({ state, apiKey, onUpdateIntel, onNavigate }: IntelModuleProps) {
  const [intel, setIntel] = useState<string | null>(state.companyIntel);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIntel = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError('');

    const context = state.jd || `Company: ${state.company || 'Selected Tech Firm'}`;
    const prompt = `Research and provide 5 deep-dive technical interview specific insights about ${context}. Include: 1. Recent tech stack shifts 2. Common behavioral focus 3. Recent public engineering challenges 4. "Hidden" culture markers. Format as clean Markdown.`;

    try {
      const response = await callGemini(apiKey, prompt, 'You are an elite corporate intelligence officer. provide specific, actionable, and non-generic competitive intel.', 'gemini-1.5-pro');
      setIntel(response);
      onUpdateIntel(response);
    } catch (e: any) {
      setError('Intelligence Extraction Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!intel && !loading && !error) {
      fetchIntel();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onNavigate(Screen.DASHBOARD)}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 mb-2 flex items-center gap-2">
                 <ShieldCheck className="w-3 h-3" /> SECURITY_CLEARANCE_LVL_4 // DEEP_INTEL
              </div>
              <h2 className="text-3xl font-display font-black text-stone-100 italic tracking-tight uppercase">Company Intelligence</h2>
           </div>
        </div>
        <button 
          onClick={fetchIntel}
          disabled={loading}
          className="p-3 rounded-xl bg-surface-2 border border-white/5 text-stone-500 hover:text-accent transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {loading ? (
        <div className="space-y-8 py-20">
          <div className="flex flex-col items-center justify-center animate-pulse">
             <Globe className="w-16 h-16 text-accent/20 animate-spin transition-all duration-[3000ms] mb-6" />
             <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/60">Scouring Public Registries & Engineering Blogs...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto opacity-20">
             <div className="h-4 bg-stone-800 rounded w-3/4 mx-auto"></div>
             <div className="h-4 bg-stone-800 rounded w-1/2 mx-auto"></div>
             <div className="h-4 bg-stone-800 rounded w-5/6 mx-auto"></div>
             <div className="h-4 bg-stone-800 rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-200 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button onClick={fetchIntel} className="mt-6 px-10 py-4 bg-red-400 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-300 transition-all">Retry Extraction</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Sidebar meta */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-1 border border-white/5 p-6 rounded-2xl space-y-4">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Building2 className="w-4 h-4 text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Profile Context</h3>
                 </div>
                 <div className="space-y-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                    <div>
                       <span className="block text-stone-700 mb-1">Target ENTITY</span>
                       <span className="text-stone-300">{state.company || 'General Tech'}</span>
                    </div>
                    <div>
                       <span className="block text-stone-700 mb-1">Search Parameters</span>
                       <span className="text-stone-300">{state.level} Level // {state.mode}</span>
                    </div>
                    <div className="pt-4 flex items-center gap-2 text-accent/40 italic">
                       <Zap className="w-3 h-3" /> Real-time Synthesis Active
                    </div>
                 </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-accent">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Guidance</span>
                 </div>
                 <p className="text-[10px] text-accent/80 leading-relaxed uppercase tracking-tighter">
                   Use these insights to frame your answers. Mention current challenges and stack shifts to demonstrate industry awareness.
                 </p>
              </div>
           </div>

           {/* Content */}
           <div className="lg:col-span-8">
              <div className="bg-surface-1 border border-white/5 p-10 rounded-3xl markdown-body text-stone-300 leading-relaxed shadow-2xl">
                 <ReactMarkdown>{intel || ''}</ReactMarkdown>
              </div>
              <div className="mt-8 flex justify-end">
                 <button 
                  onClick={() => onNavigate(Screen.DASHBOARD)}
                  className="bg-accent hover:bg-accent-light text-black font-black uppercase tracking-[0.4em] text-[10px] px-10 py-5 rounded-2xl shadow-xl shadow-accent/10 transition-all"
                 >
                   Sync to Dashboard
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
