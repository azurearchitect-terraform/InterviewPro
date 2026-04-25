/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Timer, CheckCircle, XCircle, ChevronRight, Play, RefreshCw, AlertCircle, Clock, Trophy, ArrowLeft } from 'lucide-react';
import { AppState, MCQSession, MCQQuestion } from '../types';
import { callGemini } from '../services/gemini';

interface MCQViewProps {
  state: AppState;
  apiKey: string;
  onUpdateSession: (session: MCQSession) => void;
  onNavigate: (screen: 'results' | 'home') => void;
}

export function MCQView({ state, apiKey, onUpdateSession, onNavigate }: MCQViewProps) {
  const [topic, setTopic] = useState('System Design & Algorithms');
  const [difficulty, setDifficulty] = useState('medium');
  const [timePerQ, setTimePerQ] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [session, setSession] = useState<MCQSession | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mcqResults, setMcqResults] = useState<{ q: string, chosen: string | null, correct: boolean, ans: string, exp: string }[]>([]);

  // Timer logic
  useEffect(() => {
    if (session && !showExplanation && timePerQ > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [session, currentIdx, showExplanation, timePerQ]);

  const handleAutoSubmit = () => {
    if (!showExplanation) {
       checkAnswer(null);
    }
  };

  const startMCQ = async () => {
    setLoading(true);
    setError('');
    
    // Generate 10 questions as requested
    const prompt = `
Generate exactly 10 high-quality multiple-choice questions on "${topic}" at "${difficulty}" difficulty.

Format (exactly this for each question, separated by ---):
Q: [question]
A: [option A]
B: [option B]
C: [option C]
D: [option D]
ANS: [A/B/C/D]
EXP: [one-sentence explanation]
`.trim();

    try {
      const response = await callGemini(apiKey, prompt, "You are a technical examiner. Return ONLY the raw text structured as requested.", 'gemini-1.5-flash');
      const questions = parseMCQ(response);
      
      if (questions.length === 0) throw new Error('Could not parse simulation data.');

      const newSession: MCQSession = {
        topic,
        difficulty,
        questions,
        score: 0
      };
      
      setSession(newSession);
      setCurrentIdx(0);
      setScore(0);
      setMcqResults([]);
      setTimeLeft(timePerQ);
      setSelectedOpt(null);
      setShowExplanation(false);
    } catch (e: any) {
      setError('Simulation Generation Error: ' + (e.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const parseMCQ = (raw: string): MCQQuestion[] => {
    const blocks = raw.split(/---+/).map(b => b.trim()).filter(Boolean);
    return blocks.map(b => {
      const q = b.match(/Q:\s*(.+)/)?.[1]?.trim() || '';
      const opts = [
        { l: 'A', t: b.match(/A:\s*(.+)/)?.[1]?.trim() || '' },
        { l: 'B', t: b.match(/B:\s*(.+)/)?.[1]?.trim() || '' },
        { l: 'C', t: b.match(/C:\s*(.+)/)?.[1]?.trim() || '' },
        { l: 'D', t: b.match(/D:\s*(.+)/)?.[1]?.trim() || '' }
      ].filter(o => o.t);
      const ans = b.match(/ANS:\s*([A-D])/)?.[1]?.trim() || '';
      const exp = b.match(/EXP:\s*(.+)/)?.[1]?.trim() || '';
      return { q, opts, ans, exp };
    }).filter(q => q.q && q.ans && q.opts.length === 4);
  };

  const handleSelect = (letter: string) => {
    if (showExplanation) return;
    setSelectedOpt(letter);
  };

  const checkAnswer = (chosen: string | null) => {
    if (!session) return;
    
    const currentQ = session.questions[currentIdx];
    const isCorrect = chosen === currentQ.ans;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    setMcqResults(prev => [...prev, {
      q: currentQ.q,
      chosen,
      correct: isCorrect,
      ans: currentQ.ans,
      exp: currentQ.exp
    }]);

    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (!session) return;
    
    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setShowExplanation(false);
      setTimeLeft(timePerQ);
    } else {
      const finalSession = { ...session, score };
      onUpdateSession(finalSession);
      // Handled by final state in this component if needed
    }
  };

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex items-center gap-6">
           <button 
             onClick={() => onNavigate('home')}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 flex items-center gap-2">
                 <Clock className="w-3 h-3" /> Module: QUICK_TEST
              </div>
              <h2 className="text-4xl font-display font-extrabold text-stone-100 italic tracking-tight">Timed Proficiency</h2>
           </div>
        </header>

        <div className="bg-surface-1 border border-white/5 p-8 space-y-6 rounded-3xl bento-card relative overflow-hidden">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-600">Technical Domain</label>
              <input
                type="text"
                className="w-full bg-black/40 border border-white/5 rounded-xl text-stone-200 font-sans text-xs p-3 outline-none focus:border-accent/40"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. AWS Lambda, Kubernetes, System Design..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-600">Difficulty</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl text-stone-200 font-sans text-xs p-3 outline-none focus:border-accent/40 appearance-none cursor-pointer [&>option]:bg-surface-2 [&>option]:text-white"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Foundational</option>
                  <option value="medium">Professional</option>
                  <option value="hard">Expert</option>
                  <option value="faang">FAANG Level</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-stone-600">Timer (s)</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl text-stone-200 font-sans text-xs p-3 outline-none focus:border-accent/40 appearance-none cursor-pointer [&>option]:bg-surface-2 [&>option]:text-white"
                  value={timePerQ}
                  onChange={(e) => setTimePerQ(parseInt(e.target.value))}
                >
                  <option value={20}>20s Sprint</option>
                  <option value={30}>30s Standard</option>
                  <option value={60}>60s Relaxed</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-[11px] text-red-200 font-bold uppercase tracking-wider flex items-start gap-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={startMCQ}
            disabled={loading || !topic}
            className="w-full bg-accent hover:bg-accent-light disabled:opacity-30 text-black py-4 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all rounded-xl shadow-xl shadow-accent/10"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            Initialize Assessment Segment
          </button>
        </div>
      </div>
    );
  }

  // End State
  if (mcqResults.length === session.questions.length && showExplanation) {
     const pct = Math.round((score / session.questions.length) * 100);
     return (
       <div className="max-w-2xl mx-auto py-12 px-4 space-y-10 text-center animate-in zoom-in-95">
          <div className="bg-surface-1 border border-white/5 p-12 rounded-3xl bento-card">
            <div className="text-7xl font-display font-extrabold italic text-white mb-2">{score}/{session.questions.length}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.4em] text-accent mb-8">Score Achieved</div>
            
            <div className="space-y-4 text-left">
               {mcqResults.map((r, i) => (
                 <div key={i} className="flex gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="pt-1">
                      {r.correct ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-200 leading-relaxed mb-1">{r.q}</div>
                      <div className="text-[10px] text-stone-500 italic">{r.exp}</div>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex gap-4 mt-12">
               <button 
                onClick={() => setSession(null)}
                className="flex-1 bg-surface-2 border border-white/5 text-stone-400 py-4 font-black uppercase tracking-widest text-[10px] rounded-xl"
               >
                 Initialize New Test
               </button>
               <button 
                onClick={() => onNavigate('home')}
                className="flex-1 bg-accent text-black py-4 font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-accent/20"
               >
                 Exit to Command Center
               </button>
            </div>
          </div>
       </div>
     );
  }

  const currentQ = session.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              if (confirm('Terminate assessment? All current progress will be lost.')) {
                setSession(null);
              }
            }}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all cursor-pointer group"
            title="Emergency Stop"
          >
            <AlertCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[6px] font-black mt-1">ABORT</span>
          </button>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-accent/60 mb-2 flex items-center gap-2">
               <Trophy className="w-3 h-3" /> {topic} // SEQUENCE_{currentIdx + 1}
            </div>
            <h3 className="text-2xl font-display font-extrabold text-stone-100 italic">Predictive Assessment</h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1">Response Clock</div>
          <div className={`text-2xl font-mono font-bold tracking-tighter ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
            0:{timeLeft.toString().padStart(2, '0')}s
          </div>
        </div>
      </header>

      <div className="space-y-10">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
           <div 
            className="h-full bg-accent transition-all duration-500" 
            style={{ width: `${(currentIdx / session.questions.length) * 100}%` }}
          ></div>
        </div>

        <div className="text-xl text-stone-100 leading-relaxed font-bold font-display italic tracking-tight">
          {currentQ.q}
        </div>

        <div className="grid gap-4">
          {currentQ.opts.map((opt) => (
            <button
              key={opt.l}
              onClick={() => handleSelect(opt.l)}
              disabled={showExplanation}
              className={`group flex items-center gap-6 p-6 border rounded-2xl transition-all ${
                selectedOpt === opt.l
                  ? 'bg-accent/10 border-accent/40 text-accent-light'
                  : 'bg-surface-1 border-white/5 text-stone-400 hover:border-white/10'
              } ${
                showExplanation && opt.l === currentQ.ans ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : ''
              } ${
                showExplanation && selectedOpt === opt.l && opt.l !== currentQ.ans ? 'bg-red-500/10 border-red-500/40 text-red-400' : ''
              } disabled:cursor-default`}
            >
              <div className={`w-8 h-8 flex items-center justify-center font-black text-[10px] rounded-lg transition-all ${
                selectedOpt === opt.l ? 'bg-accent text-black font-display font-black italic' : 'bg-black/20 text-stone-600 group-hover:text-stone-400'
              }`}>
                {opt.l}
              </div>
              <span className="text-sm font-bold tracking-tight">{opt.t}</span>
              {showExplanation && opt.l === currentQ.ans && (
                <CheckCircle className="w-5 h-5 ml-auto text-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {showExplanation && (
          <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl space-y-2 animate-in slide-in-from-bottom-2">
            <div className="text-[9px] font-black uppercase tracking-widest text-accent/60">Analytical Insight</div>
            <p className="text-stone-300 text-xs leading-relaxed italic font-medium">{currentQ.exp}</p>
          </div>
        )}
      </div>

      <footer className="pt-8 border-t border-white/5 flex justify-end">
        {!showExplanation ? (
          <button
            onClick={() => checkAnswer(selectedOpt)}
            disabled={!selectedOpt}
            className="bg-accent hover:bg-accent-light disabled:opacity-30 text-black px-10 py-4 font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-accent/10"
          >
            Review Result
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="bg-accent hover:bg-accent-light text-black px-10 py-4 font-black uppercase tracking-widest text-[11px] rounded-xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-accent/10"
          >
            {currentIdx < session.questions.length - 1 ? 'Next Pulse Sequence' : 'Finalize Records'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}
