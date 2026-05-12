/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Target, Search, Sparkles, Building2, ChevronRight, AlertCircle, RefreshCw, Key, LayoutDashboard, FileSearch, Shield, HelpCircle, DollarSign, BookOpen, Zap } from 'lucide-react';
import { AppState, RoleLevel, InterviewMode, Screen, CandidatePersona, FeedbackStyle } from '../types';
import { callGemini } from '../services/gemini';
import { COMPANIES } from '../constants';
import { ResumeUpload } from './ResumeUpload';
import { TrackSelector } from './TrackSelector';
import { motion } from 'motion/react';

interface HomeViewProps {
  state: AppState;
  apiKey: string;
  hasSystemKeyAccess?: boolean;
  onApiKeyChange: (key: string) => void;
  onSaveApiKey: (key: string) => void;
  onAnalyze: (jd: string, level: RoleLevel, mode: InterviewMode, persona: CandidatePersona, feedbackStyle: FeedbackStyle, analysis: string) => void;
  onUpdateResume: (resume: string | null) => void;
  onUpdateTracks: (tracks: string[], custom: string[]) => void;
  onUpdateLevel: (level: RoleLevel) => void;
  onUpdateCompany: (company: string) => void;
  onUpdateExperience: (years: number) => void;
  onUpdateSalary: (salary: string, currency: string) => void;
  onUpdateLocation: (country: string, city: string) => void;
  onNavigate: (screen: Screen) => void;
}

export function HomeView({ 
  state, 
  apiKey, 
  hasSystemKeyAccess = true,
  onApiKeyChange, 
  onSaveApiKey, 
  onAnalyze, 
  onUpdateResume, 
  onUpdateTracks, 
  onUpdateLevel,
  onUpdateCompany,
  onUpdateExperience,
  onUpdateSalary,
  onUpdateLocation,
  onNavigate 
}: HomeViewProps) {
  const [jd, setJd] = useState(state.jd);
  const [level, setLevel] = useState<RoleLevel>(state.level);
  const [mode, setMode] = useState<InterviewMode>(state.mode);
  const [feedbackStyle, setFeedbackStyle] = useState<FeedbackStyle>(state.feedbackStyle || 'constructive');
  const [selectedCompany, setSelectedCompany] = useState<string>(state.company || 'None');
  const [persona, setPersona] = useState<CandidatePersona>(state.candidatePersona || 'Confident, technical, and clear.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberKey, setRememberKey] = useState(true);

  const [exp, setExp] = useState(state.yearsExperience);
  const [sal, setSal] = useState(state.currentSalary);
  const [curr, setCurr] = useState(state.currency || 'INR');
  const [country, setCountry] = useState(state.location.country);
  const [city, setCity] = useState(state.location.city);

  const syncContext = () => {
    onUpdateLevel(level);
    onUpdateCompany(selectedCompany);
    onUpdateExperience(exp);
    onUpdateSalary(sal, curr);
    onUpdateLocation(country, city);
  };

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
      // Sync local state back to App state before analysis
      syncContext();

      const companyInfo = COMPANIES[selectedCompany as keyof typeof COMPANIES];
      const companyContext = selectedCompany !== 'None' ? `Target: ${selectedCompany}. Tip: ${companyInfo.tip}.` : '';
      const trackContext = `Tracks: ${state.domainTracks.join(', ')}.`;
      
      const context = jd.substring(0, 1500) || `${selectedCompany} ${level}`;
      const prompt = `EXPERT BRIEF (200 words max):
Analyize for: "Hidden Stakes", "Golden Technical Skills", "Behavioral Landmines", "Ideal Archetype".
JD: ${context}
Target: ${companyContext}
Level: ${level}`;

      const systemInstruction = 'You are an elite interview auditor. reveal the truth behind the JD.';
      
      const analysis = await callGemini(apiKey, prompt, systemInstruction, 'gemini-1.5-flash');
      
      onAnalyze(jd, level, mode, persona, feedbackStyle, analysis);
    } catch (e: any) {
      setError('Analysis failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* Locked Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-16 z-50 bg-bg/80 backdrop-blur-md -mx-4 px-4 py-4 mb-6 border-b border-white/5"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-4 mb-1">
               <div className="px-3 py-1 bg-accent/5 border border-accent/20 rounded-full text-[8px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                  <Sparkles className="w-2.5 h-2.5" /> System_Initialization_v4.5
               </div>
            </div>
            <h1 className="text-3xl font-display font-black text-stone-100 italic tracking-tighter uppercase">Simulation <span className="text-accent underline decoration-2 underline-offset-4 decoration-accent/20">Protocol</span></h1>
          </div>
          <button 
            onClick={() => onNavigate(Screen.DASHBOARD)}
            className="hidden md:flex bg-surface-2 border border-white/5 hover:border-white/10 text-stone-400 px-6 py-2 rounded-xl font-black uppercase tracking-widest text-[9px] items-center gap-2 transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Top Config Row: Contextual Data */}
         <div className="lg:col-span-12">
            <div className="bento-card p-6 px-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="flex items-center gap-3 pr-8 md:border-r border-white/5 min-w-max">
                 <Target className="w-4 h-4 text-accent" />
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Contextual Data</h3>
              </div>
              
              <div className="flex-1 w-full grid grid-cols-2 md:flex md:flex-row gap-6">
                 <div className="space-y-2 flex-1 min-w-[80px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 block">Experience</label>
                    <input 
                      type="number" 
                      value={exp} 
                      onChange={(e) => setExp(parseInt(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono font-bold outline-none focus:border-accent ring-1 ring-white/5 shadow-inner"
                    />
                 </div>

                 <div className="space-y-2 flex-1 min-w-[120px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 block">Country</label>
                    <input 
                       type="text" 
                       value={country} 
                       onChange={(e) => setCountry(e.target.value)}
                       placeholder="Country"
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono font-bold outline-none focus:border-accent ring-1 ring-white/5 placeholder:text-stone-800 shadow-inner uppercase"
                    />
                 </div>

                 <div className="space-y-2 flex-1 min-w-[120px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 block">City</label>
                    <input 
                       type="text" 
                       value={city} 
                       onChange={(e) => setCity(e.target.value)}
                       placeholder="City"
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono font-bold outline-none focus:border-accent ring-1 ring-white/5 placeholder:text-stone-800 shadow-inner"
                    />
                 </div>

                 <div className="space-y-2 flex-1 min-w-[120px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 block">Current Salary</label>
                    <input 
                       type="text" 
                       value={sal} 
                       onChange={(e) => setSal(e.target.value)}
                       placeholder="Salary"
                       className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono font-bold outline-none focus:border-accent ring-1 ring-white/5 placeholder:text-stone-800 shadow-inner"
                    />
                 </div>

                 <div className="space-y-2 md:w-32 min-w-[100px]">
                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500 block">Currency</label>
                    <div className="relative">
                       <select 
                          value={curr} 
                          onChange={(e) => setCurr(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white font-mono font-bold outline-none focus:border-accent appearance-none ring-1 ring-white/5 shadow-inner"
                       >
                          <option value="USD">USD</option>
                          <option value="INR">INR</option>
                          <option value="EUR">EUR</option>
                          <option value="GBP">GBP</option>
                          <option value="CAD">CAD</option>
                       </select>
                       <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-500">
                          <ChevronRight className="w-3 h-3 rotate-90" />
                       </div>
                    </div>
                 </div>
              </div>
            </div>
         </div>

         {/* Left Col: Target & Context */}
         <div className="lg:col-span-3 space-y-10">
            <TrackSelector 
              currentTracks={state.domainTracks}
              customDomains={state.customDomains}
              onUpdateTracks={onUpdateTracks}
            />

            <div className="bento-card p-8 space-y-6">
               <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Shield className="w-4 h-4 text-stone-400" />
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Tactical Assets</h3>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  <AssetCard 
                    icon={<HelpCircle className="w-4 h-4" />} 
                    title="Question Bank" 
                    desc="Real-world corporate queries"
                    onClick={() => onNavigate(Screen.QUESTION_BANK)}
                  />
                  <AssetCard 
                    icon={<Zap className="w-4 h-4" />} 
                    title="Flash UI" 
                    desc="Neural retention drills"
                    onClick={() => onNavigate(Screen.FLASHCARDS)}
                  />
                  <AssetCard 
                    icon={<DollarSign className="w-4 h-4" />} 
                    title="Salary Intel" 
                    desc="Compensation benchmarks"
                    onClick={() => {
                        syncContext();
                        onNavigate(Screen.SALARY);
                    }}
                  />
                  <AssetCard 
                    icon={<BookOpen className="w-4 h-4" />} 
                    title="User Manual" 
                    desc="Operational protocols"
                    onClick={() => onNavigate(Screen.GUIDE)}
                  />
               </div>
            </div>

         </div>

         {/* Center Col: JD Input & Target Grid */}
         <div className="lg:col-span-6 space-y-8">
            <div className="bento-card p-8 space-y-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                  <FileSearch className="w-48 h-48 text-accent" />
               </div>
               
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <FileSearch className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Requirement Feed</h3>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest">Buffer_Active // {jd.length} chars</span>
               </div>

               <textarea
                 className="w-full h-[280px] bg-black/20 border border-white/10 rounded-2xl p-8 text-base text-white font-mono font-bold leading-relaxed outline-none focus:border-accent/60 transition-all resize-none scrollbar-hide shadow-inner ring-1 ring-white/10"
                 placeholder="Paste the full JD or specific requirements here for intelligence extraction..."
                 value={jd}
                 onChange={(e) => setJd(e.target.value)}
               />

               <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-[0.15em] text-white block">Candidate Identity Alias</label>
                  <input
                    type="text"
                    value={persona}
                    onChange={(e) => setPersona(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-base text-white font-display italic font-black outline-none focus:border-accent ring-1 ring-white/10 shadow-xl placeholder:text-stone-800"
                    placeholder="e.g. Senior Cloud Architect specializing in K8s"
                  />
               </div>
            </div>

            <div className="bento-card p-6 shadow-xl space-y-6">
               <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Target Corporations</h3>
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-stone-300">Selected: {selectedCompany}</span>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                {Object.entries(COMPANIES).map(([name, info]) => (
                  <button
                    key={name}
                    onClick={() => {
                        setSelectedCompany(name);
                        onUpdateCompany(name);
                    }}
                    className={`p-4 text-left transition-all border rounded-2xl group flex flex-col justify-between h-full min-h-[100px] relative overflow-hidden ${
                      selectedCompany === name 
                        ? 'bg-accent/10 border-accent/40 ring-1 ring-accent/20 shadow-lg shadow-accent/5' 
                        : 'bg-black/20 border-white/5 text-stone-500 hover:border-white/10 hover:bg-white/[0.04]'
                    } ${name === 'FAANG' ? 'border-accent/40 shadow-[0_0_20px_rgba(139,116,255,0.15)] bg-accent/5' : ''}`}
                  >
                    {name === 'FAANG' && (
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-accent text-[6px] font-black uppercase tracking-widest text-white rounded-bl shadow-lg">Elite Mode</div>
                    )}
                    <div className="flex items-start justify-between w-full mb-3">
                        <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${
                          selectedCompany === name ? 'text-accent-light' : 'text-stone-200'
                        } ${name === 'FAANG' ? 'text-accent' : ''}`}>{name}</span>
                        {selectedCompany === name && <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] text-stone-400 italic leading-snug line-clamp-2 transition-colors group-hover:text-stone-200">
                        "{info.tip || 'Deep intel available.'}"
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
               <button
                 onClick={handleAnalyze}
                 disabled={loading || !jd || !apiKey}
                 className={`flex-1 py-10 rounded-2xl font-black uppercase tracking-[0.5em] text-base transition-all flex items-center justify-center gap-6 group relative overflow-hidden ${
                   loading || !jd || !apiKey 
                     ? 'bg-stone-900 border border-white/5 text-stone-700 cursor-not-allowed' 
                     : 'bg-accent text-white hover:scale-[1.02] shadow-[0_0_50px_rgba(139,116,255,0.25)] active:scale-[0.98]'
                 }`}
               >
                 {loading ? (
                   <>
                     <RefreshCw className="w-5 h-5 animate-spin" />
                     Extracting Intel...
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-5 h-5" />
                     Initialize Full Simulation
                   </>
                 )}
               </button>
            </div>
         </div>

         {/* Right Col: Metadata & Settings */}
         <div className="lg:col-span-3 space-y-10">
            <ResumeUpload 
              currentResume={state.resume}
              onUpload={onUpdateResume}
            />

            <div className="bento-card p-6 space-y-6">
               <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                 <Shield className="w-4 h-4 text-stone-400" />
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Settings</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-white">Grade / Level</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'Senior', 'Staff', 'Lead', 'Executive'].map((l) => (
                        <button
                          key={l}
                          onClick={() => {
                              setLevel(l as RoleLevel);
                              onUpdateLevel(l as RoleLevel);
                          }}
                          className={`px-3 py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${
                            level === l ? 'bg-accent text-black border-accent' : 'bg-black/40 border-white/10 text-stone-300'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-white">Mode</label>
                    <div className="grid grid-cols-1 gap-2">
                       {['practice', 'real', 'salary'].map((m) => (
                         <button
                           key={m}
                           onClick={() => setMode(m as InterviewMode)}
                           className={`p-3 text-left rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                             mode === m ? 'bg-surface-2 text-accent border-accent/20' : 'bg-black/20 border-white/5 text-stone-400'
                           }`}
                         >
                           {m === 'practice' ? 'Coached Drill' : m === 'real' ? 'High Stakes' : 'Salary Negotiation'}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-white">Feedback Tone</label>
                    <div className="flex flex-col gap-2">
                       {['direct', 'constructive', 'neutral'].map((s) => (
                         <button
                           key={s}
                           onClick={() => setFeedbackStyle(s as FeedbackStyle)}
                           className={`p-3 text-left px-5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                             feedbackStyle === s ? 'bg-accent/10 text-accent border-accent/20 ring-1 ring-accent/10' : 'bg-black/20 border-white/5 text-stone-500 hover:text-stone-200'
                           }`}
                         >
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5 space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-white flex items-center justify-between">
                      System Intelligence Key
                      {apiKey && <span className="text-accent underline text-[7px] cursor-default animate-pulse">Neural_Link_Established</span>}
                    </label>
                    <input
                      type="password"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white font-mono outline-none focus:border-accent ring-1 ring-white/5 transition-all"
                      placeholder={hasSystemKeyAccess && process.env.GEMINI_API_KEY ? "Using System Key. Enter override if desired..." : "GEMINI_API_KEY"}
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

function AssetCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center gap-4 hover:border-accent/40 hover:bg-black/40 transition-all text-left group"
    >
       <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent/60 group-hover:text-accent group-hover:scale-110 transition-all border border-accent/10">
          {icon}
       </div>
       <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-white">{title}</h4>
          <p className="text-[10px] text-stone-400 font-medium group-hover:text-stone-300 mt-0.5">{desc}</p>
       </div>
       <ChevronRight className="w-3 h-3 text-stone-800 ml-auto group-hover:text-stone-400 group-hover:translate-x-1 transition-all" />
    </button>
  );
}
