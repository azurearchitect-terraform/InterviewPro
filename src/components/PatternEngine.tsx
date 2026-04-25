/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Brain, Zap, ArrowRight, CheckCircle2, ChevronRight, BookOpen, PenTool, RefreshCw } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface PatternEngineProps {
  state: AppState;
  apiKey: string;
  onNavigate: (screen: Screen) => void;
}

const PATTERNS = [
  { id: 'sw', name: 'Sliding Window', desc: 'Subarrays or substrings within a specific window size.' },
  { id: '2p', name: 'Two Pointers', desc: 'Searching pairs in sorted arrays or linked lists.' },
  { id: 'fs', name: 'Fast & Slow Pointers', desc: 'Cycle detection and middle element in nodes.' },
  { id: 'mi', name: 'Merge Intervals', desc: 'Overlapping ranges and interval scheduling.' },
  { id: 'bs', name: 'Binary Search', desc: 'Dividing search space in sorted structures.' },
  { id: 'dfs', name: 'DFS / BFS', desc: 'Tree and graph traversal patterns.' },
  { id: 'dp', name: 'Dynamic Programming', desc: 'Overlapping subproblems and optimal substructure.' },
  { id: 'tp', name: 'Topological Sort', desc: 'Dependency management and DAG scheduling.' },
];

export function PatternEngine({ state, apiKey, onNavigate }: PatternEngineProps) {
  const [selectedPattern, setSelectedPattern] = useState<typeof PATTERNS[0] | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<'learn' | 'quiz'>('learn');

  const startPatternSession = async (pattern: typeof PATTERNS[0]) => {
    setSelectedPattern(pattern);
    setLoading(true);
    setPhase('learn');
    setContent(null);

    const prompt = `Teach me the "${pattern.name}" coding pattern. 
Include:
1. Core Logic & Mechanics.
2. When to use it (Problem Identifiers).
3. A clean code template (pseudo-code or TS/C++).
4. One "Classic" example problem.
Keep it dense, engineer-to-engineer. Focus on the blueprint, not just one problem.`;

    try {
      const response = await callGemini(apiKey, prompt, 'You are an elite competitive programming coach. translate complex algorithms into repeatable patterns.', 'gemini-1.5-flash');
      setContent(response);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    if (!selectedPattern) return;
    setLoading(true);
    setPhase('quiz');
    setContent(null);

    const prompt = `Give me a "Pattern Recognition Quiz" for the "${selectedPattern.name}" pattern.
1. Provide a brief problem description that UNEXPECTEDLY uses this pattern.
2. Ask 2-3 deep technical questions about how to apply the pattern here (e.g. state transitions, edge cases).
3. Do NOT provide answers immediately.`;

    try {
      const response = await callGemini(apiKey, prompt, 'You are an elite competitive programming interviewer. Test candidate pattern recognition.', 'gemini-1.5-flash');
      setContent(response);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <header className="mb-12 flex items-center justify-between">
        <div>
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 mb-2 flex items-center gap-2">
              <Brain className="w-3 h-3" /> Algorithms Hub // PATTERN_ENGINE
           </div>
           <h2 className="text-4xl font-display font-black text-stone-100 italic tracking-tight uppercase">Pattern Mastery</h2>
        </div>
        <button 
          onClick={() => onNavigate(Screen.DASHBOARD)}
          className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors"
        >
          Close Session
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Pattern Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface-1 border border-white/5 rounded-3xl p-6 overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-6 flex items-center gap-2">
               <Zap className="w-3 h-3 text-accent" /> Select Core Pattern
            </h3>
            <div className="space-y-2">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startPatternSession(p)}
                  className={`w-full p-4 text-left rounded-2xl transition-all border group ${
                    selectedPattern?.id === p.id 
                      ? 'bg-accent/10 border-accent/30 text-white' 
                      : 'bg-black/20 border-white/5 text-stone-500 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-black uppercase tracking-wider">{p.name}</span>
                    <ChevronRight className={`w-3 h-3 transition-transform ${selectedPattern?.id === p.id ? 'translate-x-1 text-accent' : 'opacity-0 group-hover:opacity-100'}`} />
                  </div>
                  <p className="text-[9px] uppercase tracking-tighter text-stone-600 line-clamp-1 group-hover:text-stone-400">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-accent border border-accent/20 rounded-3xl text-black">
             <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4" />
                <h4 className="text-[10px] font-black uppercase tracking-widest leading-none">IK Philosophy</h4>
             </div>
             <p className="text-[10px] font-bold uppercase tracking-tight leading-relaxed opacity-80">
               Don't memorize problems. Learn the underlying pattern so you can solve anything they throw at you.
             </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
           {!selectedPattern ? (
             <div className="h-full min-h-[500px] bg-surface-1 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center p-12">
                <Brain className="w-16 h-16 text-stone-800 mb-6 pulse" />
                <h3 className="text-stone-400 font-display font-black uppercase tracking-widest mb-2">Initialize Pattern Module</h3>
                <p className="text-stone-600 text-[10px] uppercase tracking-tighter max-w-sm">Select an algorithmic pattern from the left to start your deep-dive learning session.</p>
             </div>
           ) : (
             <div className="space-y-6">
                <div className="flex items-center gap-4 bg-surface-1 border border-white/5 p-4 rounded-2xl">
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${phase === 'learn' ? 'bg-accent text-black' : 'text-stone-500 hover:text-white'}`} onClick={() => startPatternSession(selectedPattern)}>
                      1. Deep Study
                   </div>
                   <ArrowRight className="w-4 h-4 text-stone-800" />
                   <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${phase === 'quiz' ? 'bg-indigo-500 text-white' : 'text-stone-500 hover:text-white'}`} onClick={startQuiz}>
                      2. Recognition Quiz
                   </div>
                </div>

                <div className="bg-surface-1 border border-white/5 rounded-3xl min-h-[500px] p-10 relative overflow-hidden group shadow-2xl">
                   {loading ? (
                     <div className="absolute inset-0 bg-surface-1/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <RefreshCw className="w-8 h-8 text-accent animate-spin mb-4" />
                        <span className="text-[10px] font-mono text-accent uppercase tracking-[0.4em]">Synthesizing Pattern Blueprint...</span>
                     </div>
                   ) : (
                     <div className="markdown-body text-stone-300 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <ReactMarkdown>{content || ''}</ReactMarkdown>
                     </div>
                   )}
                   {!content && !loading && (
                      <div className="flex flex-col items-center justify-center py-20 opacity-20">
                         <PenTool className="w-12 h-12 mb-4" />
                         <span className="text-xs uppercase font-mono tracking-widest">Select Phase to Load Data</span>
                      </div>
                   )}
                </div>

                <div className="flex justify-between items-center px-4">
                   <div className="flex items-center gap-2 text-stone-600 text-[10px] uppercase tracking-[0.2em] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Protocol: {selectedPattern.name.toUpperCase()}
                   </div>
                   {phase === 'learn' && content && (
                      <button 
                        onClick={startQuiz}
                        className="bg-accent hover:bg-accent-light text-black font-black uppercase tracking-[0.3em] text-[10px] px-8 py-4 rounded-xl transition-all shadow-xl shadow-accent/10"
                      >
                        Start Quiz
                      </button>
                   )}
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
