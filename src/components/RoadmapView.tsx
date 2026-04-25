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
Generate a Cloud Engineering learning roadmap based on this context:
Job Description Analysis: ${state.jdAnalysis}
Target Level: ${state.level}

Return a JSON array of objects with exactly these keys: category, topic, status (all "todo"), importance ("high", "medium", or "low"). 
Limit to 10 key topics. Focus on infrastructure, security, networking, and scaling.
Example: [{"category": "IaC", "topic": "Terraform Modules", "status": "todo", "importance": "high"}]
`;

      const response = await callGemini(apiKey, prompt, "You are a Cloud Engineering career coach. Return ONLY valid JSON.", 'gemini-3.1-pro-preview');
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

  const categories = Array.from(new Set(state.roadmap.map(item => item.category)));

  return (
    <div className="py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-6">
           <button 
             onClick={() => onNavigate(Screen.DASHBOARD)}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-2">Curriculum Engine</p>
              <h1 className="font-serif italic text-4xl text-stone-100">Learning Roadmap</h1>
           </div>
        </div>
        <button 
          onClick={generateRoadmap}
          disabled={loading}
          className="flex items-center gap-3 px-6 py-3 border border-white/10 text-[10px] uppercase tracking-widest text-stone-400 font-bold hover:bg-white/5 transition-all disabled:opacity-30"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-accent" />}
          {loading ? 'Analyzing Complexity...' : 'Regenerate Path'}
        </button>
      </header>

      {state.roadmap.length === 0 && !loading && (
        <div className="bg-surface border border-white/5 p-20 text-center flex flex-col items-center">
          <Map className="w-12 h-12 text-stone-800 mb-6" />
          <h3 className="text-xl font-serif italic text-stone-400 mb-2">No Roadmap Initialized</h3>
          <p className="text-sm text-stone-600 max-w-sm mb-8">Analyze a job description first to generate a customized learning path.</p>
        </div>
      )}

      {loading && state.roadmap.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-surface/40 animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-12">
        {categories.map((cat) => (
          <section key={cat} className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-black text-stone-600 flex items-center gap-4">
              <span className="w-2 h-2 bg-accent/30 rounded-full"></span>
              {cat}
              <span className="flex-1 h-[1px] bg-white/5"></span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {state.roadmap.filter(i => i.category === cat).map((item, idx) => (
                <div 
                  key={idx} 
                  className={`bg-surface border border-white/5 p-6 flex items-start gap-4 transition-all group ${
                    item.status === 'mastered' ? 'opacity-60 grayscale' : 'hover:border-accent/30'
                  }`}
                >
                  <div className="mt-1">
                    {item.status === 'mastered' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-stone-700 group-hover:text-accent transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-stone-200">{item.topic}</span>
                      <span className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 border ${
                        item.importance === 'high' ? 'border-red-500/30 text-red-400 bg-red-500/5' :
                        item.importance === 'medium' ? 'border-accent/30 text-accent bg-accent/5' :
                        'border-stone-700 text-stone-600'
                      }`}>
                        {item.importance}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-600 leading-relaxed italic">
                      {item.importance === 'high' ? 'Critical for the interview.' : 'Supporting knowledge highly recommended.'}
                    </p>
                  </div>
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
