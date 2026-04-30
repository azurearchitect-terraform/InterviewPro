import { motion } from 'motion/react';
import { BookOpen, Target, Brain, Shield, Zap, DollarSign, ArrowLeft, Lightbulb, Play } from 'lucide-react';
import { Screen } from '../types';

interface GuideViewProps {
  onNavigate: (screen: Screen) => void;
}

export function GuideView({ onNavigate }: GuideViewProps) {
  const steps = [
    {
      title: "1. Initialization",
      icon: <Target className="w-5 h-5 text-accent" />,
      desc: "Paste your targeted Job Description and upload your Resume. The system will perform a cross-vector analysis to identify hidden stakes and required skill archetypes."
    },
    {
      title: "2. Intelligence Gathering",
      icon: <Shield className="w-5 h-5 text-accent" />,
      desc: "Use the 'Company Intelligence' and 'Salary Intelligence' panels to gather deep intel on your target corporation's interviewing patterns and compensation benchmarks."
    },
    {
      title: "3. Skill Calibration",
      icon: <Brain className="w-5 h-5 text-accent" />,
      desc: "Run 'Timed Proficiency' (MCQ) or 'JD Validation' sessions to identify knowledge gaps. Follow the 'Learning Roadmap' for weekly milestones to bridge these gaps."
    },
    {
      title: "4. The Simulation",
      icon: <Play className="w-5 h-5 text-accent" />,
      desc: "Construct your panel from expert interviewers like 'The Architect' or 'The Behavioralist'. Use the tiered hint system if you get stuck and recording mode for playback review."
    },
    {
      title: "5. Feedback Loop",
      icon: <Zap className="w-5 h-5 text-accent" />,
      desc: "Review your performance metrics in the 'Intelligence Dashboard'. Track your Filler Word frequency and Confidence Score to refine your delivery."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-6 flex items-center gap-4">
        <button 
          onClick={() => onNavigate(Screen.HOME)}
          className="p-2 bg-surface-1 border border-white/5 rounded-lg text-stone-500 hover:text-accent transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <div className="text-[8px] font-black uppercase tracking-[0.2em] text-accent/60 mb-0.5 flex items-center gap-1.5">
            <BookOpen className="w-2.5 h-2.5" /> ARCHIVE_MANUAL // USAGE_GUIDE
          </div>
          <h2 className="text-2xl font-display font-black text-stone-100 italic tracking-tight uppercase">Operational Protocol</h2>
        </div>
      </header>

      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {steps.map((step, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-surface-1 border border-white/5 p-8 rounded-3xl space-y-4 hover:border-accent/20 transition-all group"
             >
                <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center border border-accent/10 group-hover:scale-110 transition-transform">
                   {step.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-white italic">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
             </motion.div>
           ))}
        </div>

        <div className="bg-accent/5 border border-accent/20 rounded-3xl p-10 space-y-6">
           <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-accent" />
              <h3 className="text-xl font-display font-bold text-accent italic uppercase tracking-tight">Pro Tips</h3>
           </div>
           <ul className="space-y-4 text-stone-400 text-sm leading-relaxed">
              <li className="flex gap-4">
                 <span className="text-accent font-black">01</span>
                 <span>Use **Salary Intelligence** before the interview loop to set your baseline expectations and gather negotiation leverage.</span>
              </li>
              <li className="flex gap-4">
                 <span className="text-accent font-black">02</span>
                 <span>Use the **Flash UI** for active recall drills. It's the most effective way to memorize corporate leadership principles or complex architectural patterns quickly.</span>
              </li>
              <li className="flex gap-4">
                 <span className="text-accent font-black">03</span>
                 <span>The **Pattern Engine** reveals algorithmic trends specific to company-tiered interviews. Master these patterns before jumping into simulations.</span>
              </li>
              <li className="flex gap-4">
                 <span className="text-accent font-black">03</span>
                 <span>Review your **Evolution** trajectory. If your behavioral scores are lagging behind technical scores, switch simulated interviewers to behavioral experts.</span>
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
}
