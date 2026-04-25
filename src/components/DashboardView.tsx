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
    <div id="screen-dashboard" className="max-w-6xl mx-auto py-6 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-10 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onNavigate(Screen.HOME)}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="space-y-2">
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 flex items-center gap-2">
                <LayoutDashboard className="w-3 h-3" />
                Archive Status // Command Center
              </div>
              <h1 className="text-5xl font-display text-stone-100 font-extrabold tracking-tight">Intelligence Dashboard</h1>
           </div>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={onReset}
             className="px-6 py-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-all font-black uppercase tracking-widest text-[9px] rounded-xl flex items-center gap-2"
           >
             <Clock className="w-3 h-3" /> Reset Profiler
           </button>
           <button 
            onClick={() => onNavigate(Screen.HOME)}
            className="bg-accent hover:bg-accent-light text-black px-8 py-3 font-extrabold uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all rounded-xl shadow-xl shadow-accent/10"
          >
            Initialize Simulation
            <Target className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-20">
        <StatCard 
          label="Simulation Accuracy" 
          value={`${avgScore}%`} 
          sub="Aggregate Performance"
          icon={<BrainCircuit className="w-4 h-4" />}
          trend={trend}
        />
        <StatCard 
          label="Total Simulations" 
          value={state.history.length.toString()} 
          sub="Archived Encounters"
          icon={<Clock className="w-4 h-4" />}
        />
        <StatCard 
          label="Evolution Vector" 
          value={avgScore > 0 ? "Optimizing" : "Baseline"} 
          sub="Long-term Growth"
          icon={<TrendingUp className="w-4 h-4" />}
          onClick={() => onNavigate(Screen.EVOLUTION)}
        />
         <StatCard 
          label="Career Progression" 
          value="On Track" 
          sub="Roadmap Status"
          icon={<Target className="w-4 h-4" />}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Technical Proficiency Table */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Technical Proficiency" icon={<BarChart3 className="w-4 h-4" />} />
          <div className="bg-surface-1 border border-white/5 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {state.skills.map(skill => (
              <SkillBar key={skill.name} skill={skill} />
            ))}
            {state.skills.length === 0 && (
              <div className="md:col-span-2 py-12 text-center">
                <p className="text-stone-600 text-xs italic">No technical benchmarks recorded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Bento - Right side */}
        <div className="space-y-6">
          <SectionHeader title="Intelligence Tools" icon={<BrainCircuit className="w-4 h-4" />} />
          <div className="grid grid-cols-1 gap-4">
             <BentoSmall 
               title="Company Intel" 
               desc="Deep dive insights." 
               icon={<LayoutDashboard className="w-4 h-4" />}
               onClick={() => onNavigate(Screen.INTEL)}
             />
             <BentoSmall 
               title="JD Validation" 
               desc="Skill assessment quiz." 
               icon={<Target className="w-4 h-4" />}
               onClick={() => onNavigate(Screen.QUIZ)}
             />
             <BentoSmall 
               title="Skill Roadmap" 
               desc="Executive trajectory." 
               icon={<BookOpen className="w-4 h-4" />}
               onClick={() => onNavigate(Screen.ROADMAP)}
             />
          </div>
        </div>
      </div>

      {/* Action Bento Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
        <BentoAction 
          title="Career Evolution" 
          desc="Visualize your long-term growth and performance trajectory."
          onClick={() => onNavigate(Screen.EVOLUTION)}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <BentoAction 
          title="Pattern Mastery" 
          desc="AI Pattern coach for algorithmic problem-solving logic."
          onClick={() => onNavigate(Screen.PATTERNS)}
          icon={<Brain className="w-5 h-5" />}
        />
        <BentoAction 
          title="Validation Engine" 
          desc="AI-generated MCQ assessments and JD-specific quizzes."
          onClick={() => onNavigate(Screen.MCQ)}
          icon={<Target className="w-5 h-5" />}
        />
        <BentoAction 
          title="Salary Intelligence" 
          desc="Market-real data on offers, TC, and levels."
          onClick={() => onNavigate(Screen.SALARY)}
          icon={<DollarSign className="w-5 h-5" />}
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
        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-600">{label}</div>
        <div className="text-3xl font-display font-extrabold text-stone-100 italic">{value}</div>
        <div className="text-[10px] text-stone-500 font-sans">{sub}</div>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
      <div className="p-1 text-accent/50">{icon}</div>
      <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-stone-400">{title}</h2>
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
      className={`relative p-8 h-48 text-left border border-white/5 overflow-hidden group transition-all hover:border-accent/40 bg-surface-1 rounded-2xl`}
    >
      <div className="absolute top-0 right-0 p-8 text-white/5 group-hover:text-accent/10 transition-colors">
        {icon}
      </div>
      <div className="relative z-10 space-y-3 h-full flex flex-col justify-end">
        <h3 className="text-lg font-display font-extrabold italic text-stone-200">{title}</h3>
        <p className="text-xs text-stone-500 leading-relaxed max-w-[200px]">{desc}</p>
        <div className="pt-2 text-accent flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          Execute Access <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}
