/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Target, Search, Sparkles, Building2, ChevronRight, AlertCircle, RefreshCw, Key, LayoutDashboard, FileSearch, Shield } from 'lucide-react';
import { AppState, RoleLevel, InterviewMode, Screen, CandidatePersona } from '../types';
import { callGemini } from '../services/gemini';
import { COMPANIES } from '../constants';
import { ResumeUpload } from './ResumeUpload';
import { TrackSelector } from './TrackSelector';
import { motion } from 'motion/react';

interface HomeViewProps {
  state: AppState;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: (key: string) => void;
  onAnalyze: (jd: string, level: RoleLevel, mode: InterviewMode, persona: CandidatePersona, analysis: string) => void;
  onUpdateResume: (resume: string | null) => void;
  onUpdateTrack: (track: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function HomeView({ state, apiKey, onApiKeyChange, onSaveApiKey, onAnalyze, onUpdateResume, onUpdateTrack, onNavigate }: HomeViewProps) {
  const [jd, setJd] = useState(state.jd);
  const [level, setLevel] = useState<RoleLevel>(state.level);
  const [mode, setMode] = useState<InterviewMode>(state.mode);
  const [selectedCompany, setSelectedCompany] = useState<string>(state.company || 'None');
  const [persona, setPersona] = useState<CandidatePersona>(state.candidatePersona || 'Confident, technical, and clear.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberKey, setRememberKey] = useState(true);

  const handleAnalyze = async () => {
    if (!apiKey) {
      setError('Gemini API key is required to initialize simulation.');
      return;
    }
    
    if (rememberKey) {
      onSaveApiKey(apiKey);
    }

    setLoading(true);
    setError('');

    try {
      const companyInfo = COMPANIES[selectedCompany as keyof typeof COMPANIES];
      const companyContext = selectedCompany !== 'None' ? `Target Company: ${selectedCompany}. Tip: ${companyInfo.tip}. Patterns: ${companyInfo.pattern?.join(', ')}.` : '';
      const trackContext = `Specialization Track: ${state.domainTrack}.`;
      
      const context = jd || `${selectedCompany} role at ${level} level. Candidate Role: ${persona}`;
      const prompt = `Analyze this JD and provide a 4-bullet point brief that highlights the "Hidden Stakes", "Golden Technical Skills", "Behavioral Landmines", and "Ideal Candidate Archetype". Keep it punchy and secret-agent style.
JD: ${context}
Candidate Level: ${level}
${companyContext}
${trackContext}`;

      const systemInstruction = 'You are an elite interview auditor. reveal the truth behind the JD.';
      
      const analysis = await callGemini(apiKey, prompt, systemInstruction, 'gemini-1.5-flash');
      
      onAnalyze(jd, level, mode, persona, analysis);
    } catch (e: any) {
      setError('Analysis failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-2">
           <div className="px-5 py-1.5 bg-accent/5 border border-accent/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-accent flex items-center gap-2">
              <Sparkles className="w-3 h-3" /> System_Initialization_v4.2
           </div>
        </div>
        <h1 className="text-5xl font-display font-black text-stone-100 italic tracking-tighter uppercase">Simulation <span className="text-accent underline decoration-4 underline-offset-4 decoration-accent/20">Protocol</span></h1>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Left Col: Target & Context */}
         <div className="lg:col-span-3 space-y-10">
            <TrackSelector 
              currentTrack={state.domainTrack}
              onSelect={onUpdateTrack}
            />

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Building2 className="w-4 h-4 text-stone-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Target Corporation</h3>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(COMPANIES).map(([name, info]) => (
                  <button
                    key={name}
                    onClick={() => setSelectedCompany(name)}
                    className={`p-4 text-left transition-all border rounded-2xl group ${
                      selectedCompany === name 
                        ? 'bg-accent/10 border-accent/40 text-accent-light' 
                        : 'bg-black/20 border-white/5 text-stone-500 hover:border-white/10 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
                          selectedCompany === name ? 'translate-x-1' : 'group-hover:translate-x-0.5'
                        }`}>{name}</span>
                        {selectedCompany === name && <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>}
                    </div>
                    
                    {selectedCompany === name && (name !== 'None') && (
                      <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[9px] text-stone-400 italic lowercase tracking-tight leading-relaxed line-clamp-2">
                          "{info.tip}"
                        </p>
                        {info.pattern && (
                          <div className="flex flex-wrap gap-1">
                            {info.pattern.map((round, i) => (
                              <span key={i} className="text-[7px] bg-black/40 px-1.5 py-0.5 rounded text-stone-300 uppercase truncate">
                                {round.split('(')[0]}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
         </div>

         {/* Center Col: JD Input */}
         <div className="lg:col-span-6 space-y-8">
            <div className="bg-surface-1 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileSearch className="w-32 h-32 text-accent" />
               </div>
               
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <FileSearch className="w-4 h-4 text-accent" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Requirement Feed</h3>
                  </div>
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-widest">Buffer_Active // {jd.length} chars</span>
               </div>

               <textarea
                 className="w-full h-[400px] bg-black/20 border border-white/5 rounded-2xl p-6 text-sm text-stone-300 font-mono leading-relaxed outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all resize-none scrollbar-hide"
                 placeholder="Paste the full JD or specific requirements here for intelligence extraction..."
                 value={jd}
                 onChange={(e) => setJd(e.target.value)}
               />

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-600 block">Candidate Identity Alias</label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl p-4 text-xs text-white font-display italic font-bold outline-none focus:border-accent"
                    placeholder="e.g. Senior Cloud Architect specializing in K8s"
                  />
               </div>
            </div>

            <div className="flex gap-4">
               <button
                 onClick={handleAnalyze}
                 disabled={loading || !jd || !apiKey}
                 className={`flex-3 py-6 rounded-2xl font-black uppercase tracking-[0.5em] text-[11px] transition-all flex items-center justify-center gap-4 group relative overflow-hidden ${
                   loading || !jd || !apiKey ? 'bg-stone-800 text-stone-600 cursor-not-allowed' : 'bg-accent text-black hover:scale-[1.02] shadow-xl shadow-accent/10'
                 }`}
               >
                 {loading ? (
                   <>
                     <RefreshCw className="w-5 h-5 animate-spin" />
                     Extracting...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-5 h-5" />
                     Initialize Simulation
                   </>
                 )}
               </button>
               <button 
                onClick={() => onNavigate(Screen.DASHBOARD)}
                className="flex-1 bg-surface-2 border border-white/5 hover:border-white/10 text-stone-400 py-6 rounded-2xl font-black uppercase tracking-widest text-[9px] flex flex-col items-center justify-center gap-1 transition-all"
               >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
               </button>
            </div>
            
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-[10px] font-bold text-red-200 uppercase tracking-widest">{error}</p>
              </div>
            )}
         </div>

         {/* Right Col: Metadata & Settings */}
         <div className="lg:col-span-3 space-y-10">
            <ResumeUpload 
              currentResume={state.resume}
              onUpload={onUpdateResume}
            />

            <div className="space-y-6 bg-surface-1 border border-white/5 rounded-3xl p-6">
               <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Shield className="w-4 h-4 text-stone-500" />
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Settings</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-600">Level</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['entry', 'mid', 'senior', 'lead', 'executive'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l as RoleLevel)}
                          className={`px-3 py-1.5 text-[8px] font-black uppercase rounded-lg border transition-all ${
                            level === l ? 'bg-white text-black border-white' : 'bg-black/20 border-white/5 text-stone-600'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-600">Mode</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['practice', 'real', 'salary'].map((m) => (
                         <button
                           key={m}
                           onClick={() => setMode(m as InterviewMode)}
                           className={`p-3 text-left rounded-xl border text-[9px] font-bold uppercase tracking-widest transition-all ${
                             mode === m ? 'bg-surface-2 text-accent border-accent/20' : 'bg-black/20 border-white/5 text-stone-600'
                           }`}
                         >
                           {m === 'practice' ? 'Coached Drill' : m === 'real' ? 'High Stakes' : 'Salary Negotiation'}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-stone-600 flex items-center justify-between">
                      System Key
                      {apiKey && <span className="text-accent underline text-[7px] cursor-default">AUTHENTICATED</span>}
                    </label>
                    <input
                      type="password"
                      className="w-full bg-black/20 border border-white/5 rounded-xl p-3 text-xs text-stone-400 font-mono outline-none focus:border-accent/40"
                      placeholder="GEMINI_API_KEY"
                      value={apiKey}
                      onChange={(e) => onApiKeyChange(e.target.value)}
                    />
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={rememberKey} 
                        onChange={(e) => setRememberKey(e.target.checked)} 
                      />
                      <div className={`w-8 h-4 rounded-full relative transition-all ${rememberKey ? 'bg-accent' : 'bg-stone-800'}`}>
                        <div className={`absolute top-1 left-1 w-2 h-2 rounded-full bg-black transition-all ${rememberKey ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-stone-600 group-hover:text-stone-400">Remember Key</span>
                    </label>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
