/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, ArrowLeft, ArrowRight, UserPlus, Fingerprint, Activity } from 'lucide-react';
import { AppState, Interviewer } from '../types';
import { INTERVIEWERS } from '../constants';

interface InterviewerViewProps {
  state: AppState;
  onBack: () => void;
  onUpdatePills: (count: number) => void;
  onUpdateInterviewers: (ids: string[]) => void;
  onStart: () => void;
}

export function InterviewerView({ state, onBack, onUpdatePills, onUpdateInterviewers, onStart }: InterviewerViewProps) {
  const toggleInterviewer = (id: string) => {
    const current = [...state.selectedInterviewers];
    const index = current.indexOf(id);
    if (index > -1) {
      if (current.length === 1) return; // Keep at least one
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    onUpdateInterviewers(current);
  };

  return (
    <div id="screen-interviewers" className="max-w-4xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 space-y-4">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 flex items-center gap-2">
           <Fingerprint className="w-3 h-3" /> Step 2 // Intelligence Panel
        </div>
        <h2 className="text-4xl font-display font-extrabold text-stone-100 italic tracking-tight">Select Personnel</h2>
        <p className="text-stone-500 text-sm leading-relaxed max-w-xl">
          Construct your assessment panel. Each interviewer provides unique technical vectors and behavioral analysis.
        </p>
      </header>

      <div className="bg-surface-1 border border-white/5 rounded-2xl p-8 relative bento-card overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 -mr-8 -mt-8 rounded-full blur-3xl transition-all"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="space-y-2 flex-1">
            <h3 className="text-[10px] font-black text-accent uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-3 h-3" /> System Context Summary
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed italic">&ldquo;{state.jdAnalysis || 'General competency mapping initialized for candidate role.'}&rdquo;</p>
          </div>
          <div className="flex gap-2">
            {[5, 7, 10].map((count) => (
              <button
                key={count}
                onClick={() => onUpdatePills(count)}
                className={`px-6 py-3 rounded-xl text-[10px] font-bold border transition-all ${
                  state.questionCount === count 
                    ? 'bg-accent text-black border-accent' 
                    : 'bg-black/20 border-white/5 text-stone-600 hover:border-accent/20'
                }`}
              >
                {count} Qs
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTERVIEWERS.map((iv) => {
          const isSelected = state.selectedInterviewers.includes(iv.id);
          return (
            <div
              key={iv.id}
              className={`relative bg-surface-1 border rounded-2xl p-8 cursor-pointer transition-all bento-card group ${
                isSelected ? 'border-accent bg-accent/5 shadow-2xl shadow-accent/5 scale-[1.02]' : 'border-white/5 hover:border-accent/30 hover:bg-surface-2'
              }`}
              onClick={() => toggleInterviewer(iv.id)}
            >
              {isSelected && (
                <div className="absolute top-6 right-6 w-5 h-5 bg-accent rounded-full flex items-center justify-center text-black shadow-lg animate-in zoom-in">
                  <Check className="w-3 h-3 stroke-[4px]" />
                </div>
              )}
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl group-hover:scale-110 transition-transform"
                style={{ backgroundColor: iv.bg }}
              >
                {iv.emoji}
              </div>
              <div className="space-y-1 mb-6">
                <div className="font-display font-extrabold italic text-stone-100 text-lg leading-none">{iv.name}</div>
                <div className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">{iv.role}</div>
              </div>
              <span className={`inline-block text-[9px] uppercase tracking-widest font-black px-4 py-2 rounded-lg border transition-all ${
                isSelected ? 'bg-accent text-black border-accent' : 'bg-black/40 text-stone-400 border-white/5 group-hover:border-accent/40 group-hover:text-accent-light'
              }`}>
                {iv.style}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 pb-20">
        <button
          className="flex-1 max-w-[180px] px-8 py-5 bg-surface-1 border border-white/5 text-stone-500 uppercase tracking-widest text-[10px] font-black rounded-2xl hover:bg-white/[0.02] hover:text-stone-300 transition-all flex items-center justify-center gap-3"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Calibration
        </button>
        <button
          className="flex-[2] px-8 py-5 bg-accent hover:bg-accent-light text-black uppercase tracking-widest text-[11px] font-black rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/10 active:scale-95 disabled:opacity-30"
          onClick={onStart}
          disabled={state.selectedInterviewers.length === 0}
        >
          Initiate Simulation Sequence
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
