/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Map, Sparkles, CheckCircle2, Circle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { AppState, RoadmapItem, Screen } from '../types';
import { callGemini } from '../services/gemini';

interface RoadmapViewProps {
  state: AppState;
  apiKey: string;
  onUpdateRoadmap: (roadmap: RoadmapItem[]) => void;
  onNavigate: (screen: Screen) => void;
}

export function RoadmapView({ state, apiKey, onUpdateRoadmap, onNavigate }: RoadmapViewProps) {
  const [loading, setLoading] = useState(false);

  const generateRoadmap = async () => {
    if (!apiKey) return;
    setLoading(true);
    
    try {
      const prompt = `
Generate a 4-week preparation roadmap for a "${state.level}" role based on:
Job Description Analysis: ${state.jdAnalysis}
Domain: ${state.domainTracks.join(', ')}

Return a JSON array of objects with exactly these keys: category, topic, status (all "todo"), importance ("high", "medium", or "low"), and week (1 to 4).
Limit to 12 key topics (3 per week).
Example: [{"category": "IaC", "topic": "Terraform Modules", "status": "todo", "importance": "high", "week": 1}]
`;

      const response = await callGemini(apiKey, prompt, "You are an elite career coach. Return ONLY valid JSON.", 'gemini-1.5-pro');
      const json = JSON.parse(response.replace(/```json|```/g, '').trim());
      onUpdateRoadmap(json);
    } catch (e) {
      console.error("Roadmap generation error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.roadmap.length === 0 && state.jdAnalysis) {
      generateRoadmap();
    }
  }, []);

  const weeks = Array.from(new Set(state.roadmap.map(item => item.week || 1))).sort((a, b) => a - b);

  return (
    <div className="py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-sm">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => onNavigate(Screen.DASHBOARD)}
             className="p-2 bg-surface-1 border border-white/5 rounded-lg text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="text-[8px] uppercase tracking-[0.2em] text-accent mb-1">Curriculum Engine</p>
              <h1 className="font-display font-black italic text-2xl text-stone-100 uppercase tracking-tighter">Mission Roadmap</h1>
           </div>
        </div>
        <button 
          onClick={generateRoadmap}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-black text-[9px] uppercase tracking-widest font-black rounded-xl hover:bg-accent-light transition-all disabled:opacity-30 shadow-lg shadow-accent/10"
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {loading ? 'Analyzing...' : 'Regenerate Path'}
        </button>
      </header>

      {state.roadmap.length === 0 && !loading && (
        <div className="bg-surface-1 border border-white/5 p-20 text-center flex flex-col items-center rounded-3xl">
          <Map className="w-12 h-12 text-stone-800 mb-6" />
          <h3 className="text-xl font-display font-bold text-stone-400 mb-2 uppercase italic">No Roadmap Operational</h3>
          <p className="text-sm text-stone-600 max-w-sm mb-8 italic">Analyze a job description first to generate a customized learning path.</p>
        </div>
      )}

      {loading && state.roadmap.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface-1/40 animate-pulse border border-white/5 rounded-3xl" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {weeks.map((week) => (
          <section key={week} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl font-display font-black italic">
                W{week}
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-stone-500">Operation Cycle // Week {week}</h3>
                <div className="h-[1px] bg-white/5 w-full mt-2"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.roadmap.filter(i => i.week === week || (!i.week && week === 1)).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`bg-surface-1 border border-white/5 p-8 rounded-3xl flex flex-col gap-4 transition-all group ${
                    item.status === 'mastered' ? 'opacity-40 grayscale' : 'hover:border-accent/30 hover:bg-surface-2'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="px-2 py-1 bg-black/40 border border-white/5 rounded text-[8px] font-black text-stone-500 uppercase tracking-widest">
                       {item.category}
                    </div>
                    {item.status === 'mastered' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-700 group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <h4 className="text-sm font-bold text-stone-100 font-display italic">{item.topic}</h4>
                    <div className={`inline-block text-[8px] uppercase tracking-widest font-black px-2 py-1 border rounded ${
                        item.importance === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                        item.importance === 'medium' ? 'border-accent/30 text-accent bg-accent/5' :
                        'border-stone-700 text-stone-600'
                    }`}>
                      {item.importance} Risk
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-600 leading-relaxed italic border-t border-white/5 pt-4">
                    {item.importance === 'high' ? 'Mission critical requirement.' : 'Strategic advantage module.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-accent/5 border border-accent/20 p-8 flex items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Map className="w-20 h-20" />
        </div>
        <AlertCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
        <div className="space-y-2 relative">
          <h4 className="text-sm font-bold text-accent uppercase tracking-widest">Coaching Protocol</h4>
          <p className="text-xs text-stone-400 leading-relaxed max-w-2xl">
            This roadmap is dynamic. As you complete interview simulations, your skills dashboard will update, 
            identifying new topics that require your attention. Master the "High Importance" items first to 
            maximize your impact in technical architecture rounds.
          </p>
        </div>
      </div>
    </div>
  );
}
