/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logout } from './services/firebase';
import { Screen, AppState, RoleLevel, InterviewMode, SkillRating, RoadmapItem, CandidatePersona } from './types';
import { HomeView } from './components/HomeView';
import { InterviewerView } from './components/InterviewerView';
import { InterviewView } from './components/InterviewView';
import { ResultsView } from './components/ResultsView';
import { DashboardView } from './components/DashboardView';
import { RoadmapView } from './components/RoadmapView';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { MCQView } from './components/MCQView';
import { EvolutionView } from './components/EvolutionView';
import { JDQuizView } from './components/JDQuizView';
import { IntelModule } from './components/IntelModule';
import { SalaryIntelligence } from './components/SalaryIntelligence';
import { PatternEngine } from './components/PatternEngine';
import { GuideView } from './components/GuideView';
import { QuestionBankView } from './components/QuestionBankView';
import { FlashcardView } from './components/FlashcardView';

export default function App() {
  const [screen, setScreen] = useState<Screen>(Screen.DASHBOARD);
  const [apiKey, setApiKey] = useState<string>('');
  const [state, setState] = useState<AppState>({
    jd: '',
    level: 'mid',
    mode: 'practice',
    feedbackStyle: 'constructive',
    candidatePersona: '',
    resume: localStorage.getItem('NIP_STORED_RESUME'),
    jdAnalysis: '',
    selectedInterviewers: ['tech', 'behavioral'],
    questionCount: 7,
    currentInterviewerIndex: 0,
    messages: [],
    questionNum: 0,
    results: [],
    skills: [
      { name: 'Core Architecture', rating: 72, trend: 'up' },
      { name: 'System Performance', rating: 64, trend: 'steady' },
      { name: 'Engineering Safety', rating: 51, trend: 'up' },
      { name: 'Strategic Alignment', rating: 38, trend: 'steady' },
    ],
    roadmap: [],
    history: [],
    companyIntel: null,
    domainTracks: [],
    customDomains: [],
    yearsExperience: 5,
    currentSalary: '',
    currency: 'INR',
    location: {
      country: '',
      city: '',
    },
  });

  const [drillQuestions, setDrillQuestions] = useState<string[] | undefined>(undefined);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  const hasSystemKeyAccess = !!user && user.email === 'hackerharnish@gmail.com';
  const effectiveApiKey = apiKey || (hasSystemKeyAccess ? process.env.GEMINI_API_KEY : '');

  // Load persistence and auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    const savedKey = localStorage.getItem('NIP_API_KEY');

    if (savedKey) {
      setApiKey(savedKey);
    }

    const savedHistory = localStorage.getItem('NIP_HISTORY');
    if (savedHistory) {
      setState(prev => ({ ...prev, history: JSON.parse(savedHistory) }));
    }

    const savedSkills = localStorage.getItem('NIP_SKILLS');
    if (savedSkills) {
      setState(prev => ({ ...prev, skills: JSON.parse(savedSkills) }));
    }

    return () => unsubscribe();
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('NIP_API_KEY', key);
  };

  const navigate = (newScreen: Screen) => {
    setScreen(newScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      if (updates.history) localStorage.setItem('NIP_HISTORY', JSON.stringify(next.history));
      if (updates.skills) localStorage.setItem('NIP_SKILLS', JSON.stringify(next.skills));
      return next;
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to purge all system data? This will clear your history and progress.')) {
      const reset: Partial<AppState> = {
        history: [],
        skills: [
          { name: 'Core Architecture', rating: 0, trend: 'steady' },
          { name: 'System Performance', rating: 0, trend: 'steady' },
          { name: 'Engineering Safety', rating: 0, trend: 'steady' },
          { name: 'Strategic Alignment', rating: 0, trend: 'steady' },
        ],
        results: [],
        jd: '',
        jdAnalysis: '',
        companyIntel: null,
      };
      updateState(reset);
      localStorage.removeItem('NIP_HISTORY');
      localStorage.removeItem('NIP_SKILLS');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-bg relative selection:bg-accent/30 selection:text-white">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate(Screen.DASHBOARD)} className="flex items-center gap-3 group">
           <div className="w-10 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-display font-black group-hover:scale-110 transition-transform">NIP</div>
           <span className="font-display font-extrabold text-xl tracking-tighter text-white italic group-hover:translate-x-1 transition-transform">NexusInterview<span className="text-accent underline decoration-accent/40 decoration-4 underline-offset-4">Pro</span></span>
        </button>

        <div className="hidden md:flex items-center gap-2">
           <NavTab active={screen === Screen.DASHBOARD || screen === Screen.EVOLUTION} onClick={() => navigate(Screen.DASHBOARD)} label="Center" />
           <NavTab active={screen === Screen.HOME || screen === Screen.INTEL || screen === Screen.QUIZ} onClick={() => navigate(Screen.HOME)} label="Initialize" />
           <NavTab active={screen === Screen.MCQ} onClick={() => navigate(Screen.MCQ)} label="Validation" />
           <NavTab active={screen === Screen.GUIDE} onClick={() => navigate(Screen.GUIDE)} label="Guide" />
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 font-medium">{user.displayName || user.email}</span>
              <button 
                onClick={logout}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all border border-red-500/30"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="bg-white text-black hover:bg-stone-200 text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl transition-all shadow-lg"
            >
              Sign In
            </button>
          )}
          <div 
            onClick={() => {
              const k = prompt('Update Intelligence Key:', apiKey);
              if (k) saveApiKey(k);
            }}
            className="bg-accent/10 border border-accent/30 text-accent text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl cursor-pointer hover:bg-accent/20 transition-all flex items-center gap-2 shadow-lg shadow-accent/5"
          >
            <div className="w-1 h-1 bg-accent rounded-full animate-pulse"></div>
            Gemini Intelligence Mode
          </div>
        </div>
      </nav>

      <main className="container mx-auto max-w-6xl py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {screen === Screen.HOME && (
              <HomeView 
                state={state} 
                apiKey={apiKey}
                hasSystemKeyAccess={hasSystemKeyAccess}
                onApiKeyChange={setApiKey}
                onSaveApiKey={saveApiKey}
                onAnalyze={(jd, level, mode, persona, feedbackStyle, analysis) => {
                  updateState({ jd, level, mode, feedbackStyle, candidatePersona: persona, jdAnalysis: analysis, companyIntel: null });
                  navigate(Screen.INTERVIEWER_SELECTION);
                }}
                onUpdateResume={(resume) => updateState({ resume })}
                onUpdateTracks={(domainTracks, customDomains) => updateState({ domainTracks, customDomains })}
                onUpdateLevel={(level) => updateState({ level })}
                onUpdateCompany={(company) => updateState({ company })}
                onUpdateExperience={(yearsExperience) => updateState({ yearsExperience })}
                onUpdateSalary={(currentSalary, currency) => updateState({ currentSalary, currency })}
                onUpdateLocation={(country, city) => updateState({ location: { country, city } })}
                onNavigate={navigate}
              />
            )}
            
            {screen === Screen.INTERVIEWER_SELECTION && (
              <InterviewerView
                state={state}
                onBack={() => navigate(Screen.HOME)}
                onUpdatePills={(count) => updateState({ questionCount: count })}
                onUpdateInterviewers={(ids) => updateState({ selectedInterviewers: ids })}
                onStart={() => navigate(Screen.INTERVIEW)}
              />
            )}

            {screen === Screen.INTERVIEW && (
              <InterviewView
                state={state}
                apiKey={effectiveApiKey || ""}
                drillQuestions={drillQuestions}
                onCancel={() => navigate(Screen.DASHBOARD)}
                onComplete={(results) => {
                  const avg = results.reduce((a, b) => a + b.score, 0) / (results.length || 1);
                  const pct = Math.round(avg * 10);
                  const newHistory = [...state.history, { date: new Date().toLocaleDateString(), score: pct, type: 'interview' as const, label: state.jd.slice(0, 15) }];
                  
                  // Update skills based on this result (simplified)
                  const newSkills = [...state.skills].map(s => ({
                    ...s,
                    rating: Math.min(100, Math.max(0, s.rating + (pct > 70 ? 2 : -1)))
                  }));

                  updateState({ results, history: newHistory, skills: newSkills });
                  navigate(Screen.RESULTS);
                }}
              />
            )}

            {screen === Screen.RESULTS && (
              <ResultsView
                results={state.results}
                onRestart={() => {
                  setDrillQuestions(undefined);
                  updateState({ jd: '', jdAnalysis: '', messages: [], results: [], questionNum: 0 });
                  navigate(Screen.HOME);
                }}
                onReplay={(questions) => {
                  setDrillQuestions(questions);
                  updateState({ messages: [], results: [], questionNum: 0 });
                  navigate(Screen.INTERVIEW);
                }}
                onGoToDashboard={() => navigate(Screen.DASHBOARD)}
              />
            )}

            {screen === Screen.DASHBOARD && (
              <DashboardView 
                state={state} 
                onNavigate={navigate}
                onReset={handleReset}
              />
            )}

            {screen === Screen.EVOLUTION && (
              <EvolutionView 
                state={state} 
                onNavigate={navigate}
              />
            )}

            {screen === Screen.ROADMAP && (
              <RoadmapView 
                state={state} 
                apiKey={effectiveApiKey || ""}
                onUpdateRoadmap={(roadmap) => updateState({ roadmap })}
                onNavigate={navigate}
              />
            )}

            {screen === Screen.KNOWLEDGE_BASE && (
              <KnowledgeBaseView 
                state={state} 
                apiKey={effectiveApiKey || ""}
                onNavigate={navigate}
              />
            )}

            {screen === Screen.MCQ && (
              <MCQView
                state={state}
                apiKey={effectiveApiKey || ""}
                onUpdateSession={(mcqSession) => {
                  const pct = Math.round((mcqSession.score / mcqSession.questions.length) * 100);
                  const newHistory = [...state.history, { date: new Date().toLocaleDateString(), score: pct, type: 'mcq' as const, label: mcqSession.topic }];
                   updateState({ history: newHistory });
                }}
                onNavigate={(s) => navigate(s === 'results' ? Screen.RESULTS : Screen.DASHBOARD)}
              />
            )}

            {screen === Screen.INTEL && (
              <IntelModule 
                state={state}
                apiKey={effectiveApiKey || ""}
                onUpdateIntel={(intel) => updateState({ companyIntel: intel })}
                onNavigate={navigate}
              />
            )}

            {screen === Screen.QUIZ && (
              <JDQuizView 
                state={state}
                apiKey={effectiveApiKey || ""}
                onComplete={(scorePct) => {
                   const newHistory = [...state.history, { date: new Date().toLocaleDateString(), score: scorePct, type: 'quiz' as const, label: 'JD Validation' }];
                   const newSkills = [...state.skills].map(s => ({
                     ...s,
                     rating: Math.min(100, Math.max(0, s.rating + (scorePct > 70 ? 4 : -3)))
                   }));
                   updateState({ history: newHistory, skills: newSkills });
                }}
                onNavigate={navigate}
              />
            )}

            {screen === Screen.SALARY && (
              <SalaryIntelligence 
                state={state}
                apiKey={effectiveApiKey || ""}
                onNavigate={navigate}
                onUpdateLevel={(level) => updateState({ level })}
                onUpdateCompany={(company) => updateState({ company })}
              />
            )}

            {screen === Screen.PATTERNS && (
              <PatternEngine 
                state={state}
                apiKey={effectiveApiKey || ""}
                onNavigate={navigate}
              />
            )}

            {screen === Screen.GUIDE && (
              <GuideView 
                onNavigate={navigate}
              />
            )}

            {screen === Screen.QUESTION_BANK && (
              <QuestionBankView 
                state={state}
                apiKey={effectiveApiKey || ""}
                onNavigate={navigate}
                onStartDrill={(qs) => {
                  setDrillQuestions(qs);
                  navigate(Screen.INTERVIEW);
                }}
              />
            )}

            {screen === Screen.FLASHCARDS && (
              <FlashcardView 
                state={state}
                apiKey={effectiveApiKey || ""}
                onNavigate={navigate}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 text-[10px] uppercase tracking-[0.3em] font-black transition-all rounded-xl ${
        active 
          ? 'bg-surface-2 text-white border border-white/5 shadow-inner' 
          : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  );
}
