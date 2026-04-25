/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RotateCcw, LayoutDashboard, Zap, Trophy, CheckCircle, TrendingUp, Download, Ghost, AlertTriangle, ArrowLeft } from 'lucide-react';
import { QuestionResult } from '../types';

interface ResultsViewProps {
  results: QuestionResult[];
  onRestart: () => void;
  onReplay: (questions?: string[]) => void;
  onGoToDashboard: () => void;
}

export function ResultsView({ results, onRestart, onReplay, onGoToDashboard }: ResultsViewProps) {
  const avg = results.reduce((a, b) => a + b.score, 0) / (results.length || 1);
  const pct = Math.round(avg * 10);
  
  // Grade logic
  let grade = { label: 'Keep Practising', sub: 'More reps needed — use the drills below.', color: 'text-red-400', stroke: '#ef4444' };
  if (pct >= 85) grade = { label: 'Outstanding', sub: "You're ready. Go get that offer.", color: 'text-emerald-400', stroke: '#22c55e' };
  else if (pct >= 70) grade = { label: 'Strong Performance', sub: 'Solid foundation — a few areas to polish.', color: 'text-accent', stroke: '#6e57ff' };
  else if (pct >= 55) grade = { label: 'On the Right Track', sub: 'Good instincts. Drill the weak spots below.', color: 'text-amber-400', stroke: '#f5a623' };

  // Simulated metrics
  const clarity = Math.min(10, Math.max(1, Math.round(avg + (Math.random() - 0.5) * 1.5)));
  const depth = Math.min(10, Math.max(1, Math.round(avg + (Math.random() - 0.5) * 1.5)));
  const relevance = Math.min(10, Math.max(1, Math.round(avg + (Math.random() - 0.5) * 1.5)));

  const weakResults = results.filter(r => r.score < 6);

  const exportPDF = () => {
    window.print();
  };

  return (
    <div id="screen-results" className="max-w-4xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
           <button 
             onClick={onGoToDashboard}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60">Session Output // Terminated</div>
              <h2 className="text-4xl font-display font-extrabold text-stone-100 italic tracking-tight">Predictive Results</h2>
           </div>
        </div>
      </header>

      <div className="bg-surface-1 border border-white/5 rounded-3xl p-12 text-center relative overflow-hidden bento-card">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
        
        <div className="relative inline-flex items-center justify-center w-52 h-52 mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="54" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
            <circle 
              cx="65" cy="65" r="54" 
              fill="none" 
              stroke={grade.stroke} 
              strokeWidth="12" 
              strokeLinecap="round"
              strokeDasharray="339"
              strokeDashoffset={339 - (339 * pct / 100)}
              className="transition-[stroke-dashoffset] duration-[2000ms] delay-500 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display font-extrabold text-6xl text-white italic tracking-tighter">{pct}%</span>
          </div>
        </div>

        <div className={`text-2xl font-display font-extrabold italic mb-2 ${grade.color}`}>
          {grade.label}
        </div>
        <p className="text-stone-500 text-sm max-w-sm mx-auto">{grade.sub}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'CLARITY_VEC', val: clarity, icon: <Zap className="w-3 h-3" /> },
          { label: 'DEPTH_VEC', val: depth, icon: <Trophy className="w-3 h-3" /> },
          { label: 'RELEVANCE_VEC', val: relevance, icon: <TrendingUp className="w-3 h-3" /> }
        ].map((m) => (
          <div key={m.label} className="bg-surface-2 border border-white/5 p-6 rounded-2xl relative group overflow-hidden">
            <div className="flex justify-between items-center mb-2">
               <div className="text-[9px] text-stone-600 font-black uppercase tracking-widest flex items-center gap-2">
                {m.icon} {m.label}
              </div>
            </div>
            <div className="font-display text-3xl text-stone-200 font-extrabold italic">{m.val}<span className="text-stone-700 font-sans text-xs not-italic ml-1">/10.0</span></div>
          </div>
        ))}
      </div>

      {weakResults.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-red-400">Weak Area Drilldown</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
             {weakResults.map((r, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-black/20 border border-red-500/10 rounded-xl">
                 <span className="text-xs text-stone-400 font-medium truncate pr-4">{r.q}</span>
                 <span className="text-[10px] font-bold text-red-400 whitespace-nowrap">{r.score}.0/10</span>
               </div>
             ))}
          </div>
          <button 
            onClick={() => onReplay(weakResults.map(r => r.q))}
            className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-black uppercase tracking-widest text-[10px] rounded-xl transition-all flex items-center justify-center gap-3 border border-red-500/20"
          >
            <Ghost className="w-4 h-4" /> Re-drill Technical Weaknesses
          </button>
        </div>
      )}

      <div className="space-y-6">
         <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">Archival Log Breakdown</h3>
          </div>
        <div className="grid grid-cols-1 gap-4">
          {results.map((r, i) => (
            <div key={i} className="bg-surface-1 border border-white/5 p-6 rounded-2xl hover:border-accent/20 transition-all group relative">
              <div className="flex justify-between items-start mb-6 gap-6">
                <div className="space-y-1">
                  <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">QUERY_{i + 1}</div>
                  <h4 className="text-sm font-bold leading-relaxed text-stone-200">{r.q}</h4>
                </div>
                <div className="font-display font-black text-2xl italic tracking-tighter text-accent">{r.score}.0</div>
              </div>
              <div className="bg-black/30 p-4 rounded-xl space-y-4">
                <div className="h-[1px] w-full bg-white/5 relative overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-accent transition-all duration-[1500ms] ease-in-out"
                    style={{ width: `${r.score * 10}%` }}
                  />
                </div>
                <div className="flex gap-4 items-start">
                   <div className="text-[10px] font-black text-accent/60 uppercase tracking-widest pt-1">Feedback</div>
                   <p className="text-xs text-stone-500 leading-relaxed italic">&ldquo;{r.feedback}&rdquo;</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-10 pb-20">
        <button
          className="flex-1 px-8 py-5 rounded-2xl border border-white/5 text-stone-500 uppercase tracking-widest text-[10px] font-black hover:bg-white/[0.02] hover:text-stone-300 transition-all flex items-center justify-center gap-3"
          onClick={() => onReplay()}
        >
          <RotateCcw className="w-4 h-4" /> Full Session
        </button>

        <button
          className="flex-1 px-8 py-5 rounded-2xl border border-white/5 text-stone-500 uppercase tracking-widest text-[10px] font-black hover:bg-white/[0.02] hover:text-stone-300 transition-all flex items-center justify-center gap-3"
          onClick={exportPDF}
        >
          <Download className="w-4 h-4" /> Archival Record
        </button>
        
        <button
          className="flex-[1.5] px-8 py-5 rounded-2xl bg-accent hover:bg-accent-light text-black uppercase tracking-widest text-[11px] font-black flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 transition-all active:scale-95"
          onClick={onGoToDashboard}
        >
          Return to Dashboard
          <LayoutDashboard className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
