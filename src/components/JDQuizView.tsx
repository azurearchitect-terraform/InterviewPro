/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Target, HelpCircle, Lightbulb, ChevronRight, CheckCircle, AlertCircle, RefreshCw, Layers, ArrowLeft } from 'lucide-react';
import { AppState, MCQQuestion, Screen } from '../types';
import { callGemini } from '../services/gemini';

interface JDQuizViewProps {
  state: AppState;
  apiKey: string;
  onComplete: (scorePct: number) => void;
  onNavigate: (screen: Screen) => void;
}

export function JDQuizView({ state, apiKey, onComplete, onNavigate }: JDQuizViewProps) {
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const generateQuiz = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError('');
    
    const prompt = `Generate 5 high-quality multiple choice questions based on this Job Description:\n\n${state.jd || 'General Engineering Role'}\n\nReturn ONLY a JSON array with schema: [{ "q": "question", "opts": [{ "l": "A", "t": "option text" }], "ans": "A", "exp": "explanation" }]`;
    
    try {
      const response = await callGemini(apiKey, prompt, 'You are a specialized JD analyzer. Create questions that test specific requirements of the role.', 'gemini-1.5-flash');
      const data = JSON.parse(response.replace(/```json|```/g, ''));
      setQuestions(data);
    } catch (e: any) {
      setError('Quiz Generation Failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length === 0 && !loading && !error) {
      generateQuiz();
    }
  }, []);

  const handleSelect = (label: string) => {
    if (finished) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: label }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowAnswer(false);
      setHint(null);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSubmit = () => {
    setFinished(true);
    const correctCount = questions.reduce((acc, q, idx) => {
      return acc + (selectedAnswers[idx] === q.ans ? 1 : 0);
    }, 0);
    const scorePct = Math.round((correctCount / questions.length) * 100);
    onComplete(scorePct);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <RefreshCw className="w-12 h-12 text-accent animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Generating Custom Assessment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-red-200 font-bold uppercase tracking-widest text-xs">{error}</p>
        <button onClick={generateQuiz} className="mt-6 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl uppercase text-[10px] font-black tracking-widest hover:bg-red-500/30 transition-all">Retry Generation</button>
      </div>
    );
  }

  if (finished) {
    const score = questions.reduce((acc, q, idx) => acc + (selectedAnswers[idx] === q.ans ? 1 : 0), 0);
    const pct = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-10 space-y-10 animate-in fade-in zoom-in-95 duration-500">
        <header className="text-center space-y-4">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center text-accent mx-auto">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-display font-extrabold italic text-stone-100 tracking-tight">Assessment Terminated</h2>
          <div className="text-[10px] uppercase tracking-[0.5em] text-stone-500">Subject Performance Index</div>
        </header>

        <div className="grid grid-cols-2 gap-6">
           <div className="bg-surface-1 border border-white/5 p-8 rounded-3xl text-center">
              <div className="text-5xl font-display font-black text-white italic mb-2">{pct}%</div>
              <div className="text-[10px] uppercase tracking-widest text-accent font-black">Proficiency Score</div>
           </div>
           <div className="bg-surface-1 border border-white/5 p-8 rounded-3xl text-center">
              <div className="text-5xl font-display font-black text-stone-500 italic mb-2">{score}/{questions.length}</div>
              <div className="text-[10px] uppercase tracking-widest text-stone-600 font-black">Passed Modules</div>
           </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className={`p-6 rounded-2xl border ${selectedAnswers[i] === q.ans ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
              <div className="flex justify-between items-start gap-4">
                <p className="text-sm font-medium text-stone-200">Q{i+1}: {q.q}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${selectedAnswers[i] === q.ans ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {selectedAnswers[i] === q.ans ? 'Match' : 'Mismtch'}
                </span>
              </div>
              <p className="mt-4 text-[10px] text-stone-500 leading-relaxed italic uppercase tracking-tighter">Analysis: {q.exp}</p>
            </div>
          ))}
        </div>

        <button onClick={() => onNavigate(Screen.DASHBOARD)} className="w-full bg-accent text-black py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] hover:bg-accent-light transition-all shadow-xl shadow-accent/10">
          Sync to Intelligence Center
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
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
                 <Layers className="w-3 h-3" /> JD_VALIDATION_ENGINE // SCAN_{currentIdx + 1}
              </div>
              <h2 className="text-3xl font-display font-black text-stone-100 italic tracking-tight uppercase">Skill Assessment</h2>
           </div>
        </div>
        <div className="text-right">
           <div className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1">Queue Progress</div>
           <div className="text-2xl font-display font-medium text-stone-500 tabular-nums">
              {currentIdx + 1}<span className="text-stone-800 text-sm">/{questions.length}</span>
           </div>
        </div>
      </header>

      <div className="bg-surface-1 border border-white/5 rounded-3xl p-10 space-y-10 shadow-2xl">
        <div className="space-y-4">
          <p className="text-xl font-medium text-white leading-relaxed">{currentQ?.q}</p>
          <div className="h-1 w-20 bg-accent/20 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {currentQ?.opts.map((opt) => (
            <button
              key={opt.l}
              onClick={() => handleSelect(opt.l)}
              className={`p-5 text-left rounded-2xl transition-all border group relative overflow-hidden ${
                selectedAnswers[currentIdx] === opt.l
                  ? 'bg-accent/10 border-accent/40 text-accent-light'
                  : 'bg-black/20 border-white/5 text-stone-400 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  selectedAnswers[currentIdx] === opt.l ? 'bg-accent text-black' : 'bg-surface-2 text-stone-600'
                }`}>
                  {opt.l}
                </div>
                <span className="text-sm font-medium">{opt.t}</span>
              </div>
            </button>
          ))}
        </div>

        {hint && (
          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2">
            <Lightbulb className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-stone-400 uppercase tracking-widest leading-relaxed">Hint Protocol: {hint}</p>
          </div>
        )}

        {showAnswer && (
          <div className="bg-accent/5 border border-accent/10 p-6 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-accent uppercase tracking-widest">
               <CheckCircle className="w-3 h-3" /> System Verification
            </div>
            <p className="text-stone-300 text-sm leading-relaxed">{currentQ.exp}</p>
            <div className="text-[10px] font-mono text-accent/40">Correct Logic Path: {currentQ.ans}</div>
          </div>
        )}

        <div className="pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setHint(`Focus on ${currentQ.exp.split(' ').slice(0, 3).join(' ')}...`);
              }}
              className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-accent transition-colors flex items-center gap-2"
            >
              <HelpCircle className="w-3 h-3" /> Request Hint
            </button>
            <button 
               onClick={() => setShowAnswer(!showAnswer)}
               className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-stone-500 hover:text-accent transition-colors flex items-center gap-2"
            >
              <Target className="w-3 h-3" /> Reveal Answer
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSkip} className="px-6 py-3 text-stone-500 text-[10px] font-black uppercase tracking-widest hover:text-stone-300">Skip_Sequence</button>
            {currentIdx < questions.length - 1 ? (
              <button 
                onClick={handleNext}
                disabled={!selectedAnswers[currentIdx]}
                className="bg-surface-2 hover:bg-surface-3 disabled:opacity-30 border border-white/5 px-8 py-3 rounded-xl text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all"
              >
                Next Level <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="bg-accent text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all hover:bg-accent-light shadow-lg shadow-accent/10"
              >
                Terminate & Finalize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
