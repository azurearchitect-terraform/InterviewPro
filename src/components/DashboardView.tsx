/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LayoutDashboard, Target, BookOpen, Clock, TrendingUp, TrendingDown, ArrowRight, BrainCircuit, BarChart3, Brain, DollarSign, ArrowLeft } from 'lucide-react';
import { AppState, Screen, SkillRating } from '../types';

interface DashboardViewProps {
  state: AppState;
  onNavigate: (screen: Screen) => void;
  onReset: () => void;
}

export function DashboardView({ state, onNavigate, onReset }: DashboardViewProps) {
  const avgScore = state.history.length > 0 
    ? Math.round(state.history.reduce((acc, curr) => acc + curr.score, 0) / state.history.length)
    : 0;

  const lastScore = state.history.length > 0 ? state.history[state.history.length - 1].score : 0;
  const previousScore = state.history.length > 1 ? state.history[state.history.length - 2].score : 0;
  const trend = lastScore >= previousScore ? 'up' : 'down';

  return (
    <div id="screen-dashboard" className="max-w-6xl mx-auto py-4 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-6 bg-bg/90 backdrop-blur-xl border-b border-white/10 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => onNavigate(Screen.HOME)}
             className="p-2 bg-surface-1 border border-white/10 rounded-lg text-stone-400 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="space-y-0.5">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                Command Center
              </div>
              <h1 className="text-3xl font-display text-stone-100 font-extrabold tracking-tight italic">Intelligence Dashboard</h1>
           </div>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={onReset}
             className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[8px] rounded-lg flex items-center gap-1.5"
           >
             <Clock className="w-3 h-3" /> Reset Profiler
           </button>
           <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="bg-accent hover:bg-accent-light text-black px-4 py-2 font-extrabold uppercase tracking-widest text-[9px] flex items-center gap-2 transition-all rounded-lg shadow-lg"
          >
            Initialize Simulation
            <Target className="w-3 h-3" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <StatCard 
          label="Accuracy" 
          value={`${avgScore}%`} 
          sub="Aggregate Performance"
          icon={<BrainCircuit className="w-3.5 h-3.5" />}
          trend={trend}
        />
        <StatCard 
          label="Simulations" 
          value={state.history.length.toString()} 
          sub="Archived Encounters"
          icon={<Clock className="w-3.5 h-3.5" />}
        />
        <StatCard 
          label="Vector" 
          value={avgScore > 0 ? "Optimizing" : "Baseline"} 
          sub="Long-term Growth"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
          onClick={() => onNavigate(Screen.EVOLUTION)}
        />
         <StatCard 
          label="Progression" 
          value="On Track" 
          sub="Status"
          icon={<Target className="w-3.5 h-3.5" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Technical Proficiency Table */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader title="Technical Proficiency" icon={<BarChart3 className="w-3 h-3" />} />
          <div className="bg-surface-1 border border-white/10 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.skills.map(skill => (
              <SkillBar key={skill.name} skill={skill} />
            ))}
            {state.skills.length === 0 && (
              <div className="md:col-span-2 py-8 text-center">
                <p className="text-stone-400 text-xs italic">No technical benchmarks recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bento - Right side */}
        <div className="space-y-4">
          <SectionHeader title="Intelligence Tools" icon={<BrainCircuit className="w-3 h-3" />} />
          <div className="grid grid-cols-1 gap-3">
             <BentoSmall 
               title="Company Intel" 
               desc="Deep dive insights." 
               icon={<LayoutDashboard className="w-3.5 h-3.5" />}
               onClick={() => onNavigate(Screen.INTEL)}
             />
             <BentoSmall 
               title="JD Validation" 
               desc="Skill assessment quiz." 
               icon={<Target className="w-3.5 h-3.5" />}
               onClick={() => onNavigate(Screen.QUIZ)}
             />
             <BentoSmall 
               title="Skill Roadmap" 
               desc="Executive trajectory." 
               icon={<BookOpen className="w-3.5 h-3.5" />}
               onClick={() => onNavigate(Screen.ROADMAP)}
             />
          </div>
        </div>
      </div>

      {/* Action Bento Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pb-8">
        <BentoAction 
          title="Career Evolution" 
          desc="Performance trajectory."
          onClick={() => onNavigate(Screen.EVOLUTION)}
          icon={<TrendingUp className="w-4 h-4" />}
        />
        <BentoAction 
          title="Pattern Mastery" 
          desc="AI Algorithmic logic."
          onClick={() => onNavigate(Screen.PATTERNS)}
          icon={<Brain className="w-4 h-4" />}
        />
        <BentoAction 
          title="Validation Engine" 
          desc="MCQ & JD Quizzes."
          onClick={() => onNavigate(Screen.MCQ)}
          icon={<Target className="w-4 h-4" />}
        />
        <BentoAction 
          title="Salary Intelligence" 
          desc="Market-data on TC."
          onClick={() => onNavigate(Screen.SALARY)}
          icon={<DollarSign className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}

function BentoSmall({ title, desc, icon, onClick }: { title: string, desc: string, icon: any, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="bg-surface-1 border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-accent/30 transition-all text-left group"
    >
       <div className="p-3 bg-black/40 text-accent/60 rounded-xl group-hover:text-accent transition-colors">
          {icon}
       </div>
       <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white">{title}</div>
          <div className="text-[9px] text-stone-500 uppercase tracking-tighter">{desc}</div>
       </div>
    </button>
  );
}

function StatCard({ label, value, sub, icon, trend, onClick }: { label: string, value: string, sub: string, icon: React.ReactNode, trend?: 'up' | 'down', onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-surface-1 border border-white/5 p-6 relative overflow-hidden group rounded-2xl ${onClick ? 'cursor-pointer hover:border-accent/40' : ''}`}
    >
      <div className="absolute top-0 left-0 w-[2px] h-0 bg-accent group-hover:h-full transition-all duration-500"></div>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 border border-white/10 bg-black/20 text-accent/60 rounded-lg">
          {icon}
        </div>
        {trend && (
          <div className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend === 'up' ? '+ Simulation' : '- Variance'}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-stone-400">{label}</div>
        <div className="text-2xl font-display font-extrabold text-stone-100 italic">{value}</div>
        <div className="text-[9px] text-stone-400 font-sans">{sub}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
      <div className="text-accent/60">{icon}</div>
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-300">{title}</h2>
    </div>
  );
}

function SkillBar({ skill }: { skill: SkillRating }) {
  return (
    <div className="bg-black/20 border border-white/5 p-4 space-y-3 rounded-lg">
      <div className="flex justify-between items-end">
        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-300 font-display">{skill.name}</div>
        <div className="text-xs font-mono text-accent font-bold">{skill.rating}%</div>
      </div>
      <div className="h-[2px] w-full bg-white/5 overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-1000" 
          style={{ width: `${skill.rating}%` }}
        ></div>
      </div>
    </div>
  );
}

function TimelineEntry({ entry, isLatest }: { entry: { date: string, score: number }, isLatest: boolean }) {
  return (
    <div className={`flex items-center justify-between p-4 border rounded-xl ${isLatest ? 'bg-accent/5 border-accent/20' : 'bg-black/10 border-white/5'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? 'bg-accent animate-pulse' : 'bg-stone-700'}`}></div>
        <div className="text-[10px] font-mono text-stone-500">{entry.date}</div>
      </div>
      <div className={`text-xs font-black tracking-widest font-display ${entry.score >= 70 ? 'text-emerald-400' : 'text-stone-300'}`}>
        SIM_SCORE: {entry.score}%
      </div>
    </div>
  );
}

function BentoAction({ title, desc, onClick, icon }: { title: string, desc: string, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`relative p-6 h-36 text-left border border-white/5 overflow-hidden group transition-all hover:border-accent/40 bg-surface-1 rounded-xl`}
    >
      <div className="absolute top-0 right-0 p-6 text-white/5 group-hover:text-accent/20 transition-colors">
        {icon}
      </div>
      <div className="relative z-10 space-y-1 h-full flex flex-col justify-end">
        <h3 className="text-base font-display font-extrabold italic text-stone-200">{title}</h3>
        <p className="text-[9px] text-stone-400 leading-relaxed max-w-[150px]">{desc}</p>
        <div className="pt-1 text-accent flex items-center gap-2 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          Access <ArrowRight className="w-2 h-2" />
        </div>
      </div>
    </button>
  );
}
