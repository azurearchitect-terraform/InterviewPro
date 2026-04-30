import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Zap, RefreshCw, ChevronRight, ChevronLeft, Brain, Sparkles } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';

interface Flashcard {
  front: string;
  back: string;
  category: string;
}

interface FlashcardViewProps {
  state: AppState;
  apiKey: string;
  onNavigate: (screen: Screen) => void;
}

export function FlashcardView({ state, apiKey, onNavigate }: FlashcardViewProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);

    const prompt = `
Generate 10 high-impact interview flashcards for a "${state.level}" role in "${state.domainTracks.join(', ')}".
Focus on: ${state.jdAnalysis || state.jd.substring(0, 500) || 'General core concepts'}
Format as a JSON array of objects: [{"front": "Question/Term", "back": "Concise high-impact answer/definition", "category": "Technical|Behavioral|System"}]
Keep answers under 30 words. Ensure the cards are highly specific to the domain tracks.
`.trim();

    try {
      const response = await callGemini(apiKey, prompt, "You are an elite study coach. Return ONLY valid JSON.", 'gemini-1.5-flash');
      const data = JSON.parse(response.replace(/```json|```/g, '').trim());
      setCards(data);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      setError('Failed to generate flash assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, [state.domainTracks, state.level]);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
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
              <Zap className="w-2.5 h-2.5" /> FLASH_PROTOCOL // v1.0
            </div>
            <h2 className="text-2xl font-display font-black text-stone-100 italic tracking-tight uppercase">Flash Retention</h2>
          </div>
        </div>
        <button 
          onClick={fetchFlashcards}
          disabled={loading}
          className="p-2 bg-accent/5 hover:bg-accent/10 border border-accent/20 rounded-lg text-accent transition-all disabled:opacity-30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
           <Zap className="w-12 h-12 text-accent animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-stone-500">Injecting Neural Assets...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-10 rounded-3xl text-center space-y-4">
           <p className="text-red-400 text-sm font-bold">{error}</p>
           <button onClick={fetchFlashcards} className="text-accent text-xs font-black uppercase tracking-widest hover:underline">Restart Protocol</button>
        </div>
      ) : cards.length > 0 ? (
        <div className="space-y-12">
          <div className="perspective-1000 relative h-[350px] w-full" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
              className="relative w-full h-full duration-500 preserve-3d cursor-pointer"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div className="absolute inset-0 w-full h-full bg-surface-1 border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl shadow-black/40">
                <div className="absolute top-8 left-8 text-[9px] font-black uppercase tracking-widest text-stone-600 bg-black/40 px-3 py-1 rounded-full border border-white/5">
                   {cards[currentIndex].category}
                </div>
                <div className="absolute bottom-8 text-[8px] font-bold text-stone-700 tracking-[0.3em] uppercase">Click to Flip</div>
                <h3 className="text-2xl md:text-3xl font-display font-black text-white italic tracking-tight uppercase leading-tight">
                  {cards[currentIndex].front}
                </h3>
              </div>

              {/* Back */}
              <div className="absolute inset-0 w-full h-full bg-accent border border-accent/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl shadow-accent/20 rotate-y-180">
                <div className="absolute top-8 left-8 text-[9px] font-black uppercase tracking-widest text-black/40 bg-black/5 px-3 py-1 rounded-full border border-black/5">
                   RESPONSE_DATA
                </div>
                <p className="text-xl md:text-2xl font-bold text-black leading-relaxed">
                  {cards[currentIndex].back}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between">
            <button onClick={prevCard} className="p-4 bg-surface-1 border border-white/5 rounded-2xl text-stone-500 hover:text-accent hover:border-accent/30 transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center gap-2">
               <span className="text-[10px] font-mono text-stone-600 tracking-widest uppercase">
                 Asset {currentIndex + 1} / {cards.length}
               </span>
               <div className="flex gap-1.5">
                  {cards.map((_, i) => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-8 bg-accent' : 'w-2 bg-stone-800'}`}></div>
                  ))}
               </div>
            </div>

            <button onClick={nextCard} className="p-4 bg-surface-1 border border-white/5 rounded-2xl text-stone-500 hover:text-accent hover:border-accent/30 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-surface-2 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <Brain className="w-6 h-6 text-stone-500" />
                <div>
                   <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Recall</h4>
                   <p className="text-[9px] text-stone-600 italic">Self-assess before flipping</p>
                </div>
             </div>
             <div className="bg-surface-2 border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-stone-500" />
                <div>
                   <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Spaced Repetition</h4>
                   <p className="text-[9px] text-stone-600 italic">Review every 48 hours</p>
                </div>
             </div>
          </div>
        </div>
      ) : null}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
