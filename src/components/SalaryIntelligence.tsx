/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DollarSign, Briefcase, TrendingUp, Info, RefreshCw, BarChart4, Target, Building2, MapPin, ArrowLeft } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface SalaryIntelligenceProps {
  state: AppState;
  apiKey: string;
  onNavigate: (screen: Screen) => void;
}

export function SalaryIntelligence({ state, apiKey, onNavigate }: SalaryIntelligenceProps) {
  const [data, setData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSalaryData = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError('');

    const locationStr = `${state.location.city}, ${state.location.country}`.trim() || 'Global';
    const context = `Company: ${state.company || 'Tier 1 Tech'}, Level: ${state.level}, Role: ${state.domainTrack}, Exp: ${state.yearsExperience} years, Location: ${locationStr}, Current Salary: ${state.currentSalary} ${state.currency}`;
    const prompt = `Provide real-world salary and offer benchmarks for: ${context}. 
Specifically calculate:
1. **Actual Market Segment**: Expected range for this ${state.level} role in ${locationStr} for someone with ${state.yearsExperience} years EXP.
2. **Performance Variance**: How much more (or less) can a candidate get based on "Strong Hire" vs "Hire" interview performance? (e.g. impact on Equity/Sign-on).
3. **Growth Vector**: Potential growth percentage from the candidate's current ${state.currentSalary} ${state.currency}.
4. **Compensation Breakdown**: TC breakdown (Base, Equity, Bonus) in ${state.currency} or USD.
5. **Negotiation Leverage**: Tactics for ${state.company} specifically.

Format as clean Markdown with clear sections. Use a table for TC breakdown. Use data current as of late 2024/2025.`;

    try {
      const response = await callGemini(apiKey, prompt, 'You are an elite talent compensation consultant. provide precise, data-driven salary intelligence.', 'gemini-1.5-pro');
      setData(response);
    } catch (e: any) {
      setError('Data Extraction Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data && !loading && !error) {
      fetchSalaryData();
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
                 <DollarSign className="w-3 h-3" /> Compensation Intelligence // MARKET_BENCHMARKS
              </div>
              <h2 className="text-3xl font-display font-black text-stone-100 italic tracking-tight uppercase">Salary Outlook</h2>
           </div>
        </div>
        <button 
          onClick={fetchSalaryData}
          disabled={loading}
          className="p-3 rounded-xl bg-surface-2 border border-white/5 text-stone-500 hover:text-accent transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {loading ? (
        <div className="space-y-8 py-20">
          <div className="flex flex-col items-center justify-center animate-pulse">
             <BarChart4 className="w-16 h-16 text-accent/20 animate-bounce transition-all duration-[3000ms] mb-6" />
             <p className="font-mono text-[10px] uppercase tracking-[0.5em] text-accent/60 text-center">Aggregating Offer Data & Leveling Guides...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/10 p-10 rounded-3xl text-center">
          <p className="text-red-200 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button onClick={fetchSalaryData} className="mt-6 px-10 py-4 bg-red-400 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-300 transition-all">Retry Probe</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {/* Sidebar meta */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-1 border border-white/5 p-6 rounded-2xl space-y-4">
                 <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <Target className="w-4 h-4 text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Target Parameters</h3>
                 </div>
                 <div className="space-y-4 text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                    <div>
                       <span className="block text-stone-700 mb-1">Entity</span>
                       <span className="text-stone-300">{state.company || 'Tier 1 Tech'}</span>
                    </div>
                    <div>
                       <span className="block text-stone-700 mb-1">Level Group</span>
                       <span className="text-stone-300">{state.level}</span>
                    </div>
                    <div>
                       <span className="block text-stone-700 mb-1">Domain</span>
                       <span className="text-stone-300">{state.domainTrack}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-accent/10 border border-accent/20 p-6 rounded-2xl space-y-3">
                 <div className="flex items-center gap-2 text-accent">
                    <Info className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Negotiation Tip</span>
                 </div>
                 <p className="text-[10px] text-accent/80 leading-relaxed uppercase tracking-tighter">
                   Always counter with data. If you have competing offers, emphasize your alignment with {state.company}'s core mission.
                 </p>
              </div>

              <div className="flex flex-col gap-4">
                 <div className="p-4 bg-surface-1 border border-white/5 rounded-xl flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-stone-600" />
                    <span className="text-[9px] font-bold text-stone-400 uppercase">Remote Friendly: Yes</span>
                 </div>
                 <div className="p-4 bg-surface-1 border border-white/5 rounded-xl flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-stone-600" />
                    <span className="text-[9px] font-bold text-stone-400 uppercase">HQ: Silicon Valley / Global</span>
                 </div>
              </div>
           </div>

           {/* Content */}
           <div className="lg:col-span-8">
              <div className="bg-surface-1 border border-white/5 p-10 rounded-3xl markdown-body text-stone-300 leading-relaxed shadow-2xl relative">
                 <div className="absolute top-4 right-4 animate-pulse">
                    <TrendingUp className="w-4 h-4 text-accent/40" />
                 </div>
                 <ReactMarkdown>{data || ''}</ReactMarkdown>
              </div>
              <div className="mt-8 flex justify-end">
                 <button 
                  onClick={() => onNavigate(Screen.DASHBOARD)}
                  className="bg-accent hover:bg-accent-light text-black font-black uppercase tracking-[0.4em] text-[10px] px-10 py-5 rounded-2xl shadow-xl shadow-accent/10 transition-all"
                 >
                   Return to Hub
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
