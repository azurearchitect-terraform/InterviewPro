import { useState, useEffect } from 'react';
import { Search, Globe, ShieldCheck, Zap, Info, RefreshCw, Layers, Building2, ArrowLeft, Target, HelpCircle, ChevronRight } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';
import ReactMarkdown from 'react-markdown';

interface QuestionBankViewProps {
  state: AppState;
  apiKey: string;
  onNavigate: (screen: Screen) => void;
  onStartDrill: (questions: string[]) => void;
}

export function QuestionBankView({ state, apiKey, onNavigate, onStartDrill }: QuestionBankViewProps) {
  const [questions, setQuestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);

    const prompt = `Provide 8 real interview questions for target: "${state.company || 'Tier 1 Tech'}", role: "${state.level} ${state.domainTracks.join(', ')}". 
Format: Exactly 8 numbered questions. No extra talk.`;

    try {
      const response = await callGemini(apiKey, prompt, 'You are an elite interview researcher. Provide accurate, company-specific question data.', 'gemini-1.5-flash');
      setQuestions(response);
    } catch (err) {
      setError('Failed to retrieve intelligence from the archive.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrill = () => {
    if (!questions) return;
    // Handle both "1." and "1)" or just numbered lines
    const qs = questions.split(/\n\d+[\.\)]\s+/).filter(q => q.trim().length > 10).map(q => q.trim());
    
    if (qs.length > 0) {
      onStartDrill(qs);
    } else {
      // Fallback: search for any numbered lines if split fails
      const manualLines = questions.split('\n').filter(l => /^\d+[\.\)]/.test(l.trim())).map(l => l.replace(/^\d+[\.\)]\s+/, '').trim());
      if (manualLines.length > 0) {
        onStartDrill(manualLines);
      } else {
        onStartDrill([questions.substring(0, 500)]);
      }
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [state.company, state.domainTracks, state.level]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => onNavigate(Screen.HOME)}
             className="p-2 bg-surface-1 border border-white/5 rounded-lg text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <div className="text-[8px] font-black uppercase tracking-[0.2em] text-accent/60 mb-0.5 flex items-center gap-1.5">
                 <HelpCircle className="w-2.5 h-2.5" /> ARCHIVE_DATA // QUESTION_BANK
              </div>
              <h2 className="text-2xl font-display font-extrabold text-stone-100 italic tracking-tight uppercase">Corporate Query Bank</h2>
           </div>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-accent text-[9px] font-black uppercase tracking-widest">{state.company || 'General Tech'}</p>
           <p className="text-stone-500 text-[8px] uppercase tracking-widest">{state.level} // {state.domainTracks.join(', ')}</p>
        </div>
      </header>

      <div className="space-y-8">
        {loading ? (
          <div className="bg-surface-1 border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center space-y-6">
             <RefreshCw className="w-12 h-12 text-accent animate-spin" />
             <p className="text-stone-500 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Decrypting Corporate Assets...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center">
             <p className="text-red-400 text-sm font-bold">{error}</p>
             <button onClick={fetchQuestions} className="mt-4 text-accent text-xs font-black uppercase tracking-widest hover:underline">Retry Extraction</button>
          </div>
        ) : questions ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                     <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-white">{state.company} Tactical Intel</h3>
                     <p className="text-[10px] text-stone-500 uppercase tracking-widest">Confidence: HIGH // Data_Source: NEURAL_ARCHIVE</p>
                  </div>
               </div>
               <button 
                 onClick={() => {
                   navigator.clipboard.writeText(questions);
                   alert('Intel copied to buffer.');
                 }}
                 className="px-4 py-2 bg-surface-2 border border-white/5 hover:border-accent/40 rounded-xl text-[9px] font-black uppercase tracking-widest text-stone-400 hover:text-accent transition-all flex items-center gap-2"
               >
                 <Zap className="w-3 h-3" /> Copy Intelligence
               </button>
            </div>
            <div className="bg-surface-1 border border-white/5 rounded-3xl p-10 markdown-body animate-in fade-in duration-700 shadow-2xl relative group">
               <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none" />
               <div className="prose prose-invert max-w-none prose-p:text-stone-400 prose-headings:text-white prose-strong:text-accent prose-code:text-accent-light prose-code:bg-accent/5 prose-code:px-1 prose-code:rounded relative z-10">
                  <ReactMarkdown>{questions || ''}</ReactMarkdown>
               </div>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="bg-accent/5 border border-accent/20 p-6 rounded-2xl flex items-center gap-4 group cursor-pointer hover:bg-accent/10 transition-all font-black text-white uppercase tracking-widest" onClick={handleDrill}>
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                 <Zap className="w-5 h-5" />
              </div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Deploy Simulation</h4>
                 <p className="text-[10px] text-stone-500 normal-case font-medium">Practice these exact questions now</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-600 ml-auto group-hover:translate-x-1 transition-transform" />
           </div>
           <div className="bg-surface-2 border border-white/5 p-6 rounded-2xl flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-all" onClick={() => onNavigate(Screen.ROADMAP)}>
              <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-stone-400">
                 <Target className="w-5 h-5" />
              </div>
              <div>
                 <h4 className="text-xs font-black text-white uppercase tracking-widest">Skill Roadmap</h4>
                 <p className="text-[10px] text-stone-500">Bridge the gaps identified here</p>
              </div>
              <ChevronRight className="w-4 h-4 text-stone-600 ml-auto group-hover:translate-x-1 transition-transform" />
           </div>
        </div>
      </div>
    </div>
  );
}
