/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Zap, Target, Award, List } from 'lucide-react';
import { AppState, Screen, HistoryItem } from '../types';

interface EvolutionViewProps {
  state: AppState;
  onNavigate: (screen: Screen) => void;
}

export function EvolutionView({ state, onNavigate }: EvolutionViewProps) {
  const data = state.history.map((h, i) => ({
    name: h.date,
    score: h.score,
    index: i + 1,
    type: h.type
  }));

  const avgScore = data.length > 0 
    ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length) 
    : 0;

  const typeCounts = state.history.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex items-center justify-between">
        <div>
           <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/60 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Career Evolution // LONG_TERM_TRACKING
           </div>
           <h2 className="text-3xl font-display font-black text-stone-100 italic tracking-tight uppercase">Performance Trajectory</h2>
        </div>
        <button 
          onClick={() => onNavigate(Screen.DASHBOARD)}
          className="text-[10px] font-black uppercase tracking-widest text-stone-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <Zap className="w-3 h-3" /> Back to Center
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-surface-1 border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Evolution Vector</h3>
            <div className="flex items-center gap-4 text-stone-600 text-[10px] font-bold uppercase tracking-widest">
               <span className="flex items-center gap-1"><div className="w-2 h-2 bg-accent rounded-full"></div> Score Index</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f1f" />
                <XAxis 
                  dataKey="name" 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#444' }}
                />
                <YAxis 
                  stroke="#444" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tick={{ fill: '#444' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #222', borderRadius: '12px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#818cf8" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-6">
           <div className="bg-surface-1 border border-white/5 p-8 rounded-3xl space-y-2 group">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-600 group-hover:text-accent transition-colors">Cumulative IQ</div>
              <div className="text-6xl font-display font-black text-white italic tracking-tighter">{avgScore}%</div>
              <div className="pt-4 flex items-center gap-2 text-green-500 font-mono text-[10px] uppercase">
                 <TrendingUp className="w-3 h-3" /> Delta +4.2% // Period_Avg
              </div>
           </div>

           <div className="bg-surface-1 border border-white/5 p-8 rounded-3xl space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-600">Activity Distribution</h4>
              <div className="space-y-4">
                 <StatBar label="Interviews" count={typeCounts.interview || 0} total={data.length} color="bg-accent" />
                 <StatBar label="MCQ Logic" count={typeCounts.mcq || 0} total={data.length} color="bg-stone-500" />
                 <StatBar label="JD Assessments" count={typeCounts.quiz || 0} total={data.length} color="bg-indigo-500" />
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <MetricCard icon={Calendar} label="Active Cycles" value={data.length.toString()} />
         <MetricCard icon={Zap} label="Peak Velocity" value="89%" />
         <MetricCard icon={Target} label="JD Alignment" value="74%" />
         <MetricCard icon={Award} label="Skill Masteries" value={state.skills.filter(s => s.rating > 80).length.toString()} />
      </div>

      {/* History Log */}
      <div className="bg-surface-1 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <List className="w-4 h-4 text-stone-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Event Log</h3>
         </div>
         <div className="divide-y divide-white/5">
            {state.history.slice().reverse().map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                <div className="flex items-center gap-4">
                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase ${
                     item.type === 'interview' ? 'bg-accent/10 text-accent' : 
                     item.type === 'mcq' ? 'bg-stone-500/10 text-stone-500' :
                     'bg-indigo-500/10 text-indigo-400'
                   }`}>
                      {item.type[0]}
                   </div>
                   <div>
                      <div className="text-[11px] font-bold text-white uppercase tracking-wider">{item.label || item.type} Assessment</div>
                      <div className="text-[9px] text-stone-600 font-mono italic">{item.date}</div>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-sm font-bold text-stone-300 tabular-nums">{item.score}%</div>
                   <div className="text-[8px] uppercase tracking-tighter text-stone-600 font-black">Performance Index</div>
                </div>
              </div>
            ))}
            {state.history.length === 0 && (
              <div className="p-10 text-center text-stone-600 font-mono text-[10px] uppercase tracking-widest">
                No activity logs found. Initialize first simulation.
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

function StatBar({ label, count, total, color }: { label: string, count: number, total: number, color: string }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider">
          <span className="text-stone-400">{label}</span>
          <span className="text-white">{count} ({Math.round(pct)}%)</span>
       </div>
       <div className="h-1 bg-black/40 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
       </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-surface-1 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-all">
       <div>
          <div className="text-[9px] font-black uppercase tracking-widest text-stone-600 mb-1 group-hover:text-stone-400 transition-colors">{label}</div>
          <div className="text-2xl font-display font-black text-white italic group-hover:scale-105 transition-transform origin-left">{value}</div>
       </div>
       <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-stone-700 group-hover:text-accent transition-colors">
          <Icon className="w-5 h-5" />
       </div>
    </div>
  );
}
