/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Send, User, ChevronRight, AlertCircle, Mic, MicOff, Lightbulb, Sparkles, Clock } from 'lucide-react';
import { AppState, Message, QuestionResult, Interviewer } from '../types';
import { INTERVIEWERS } from '../constants';
import { callGemini } from '../services/gemini';

interface InterviewViewProps {
  state: AppState;
  apiKey: string;
  drillQuestions?: string[];
  onComplete: (results: QuestionResult[]) => void;
  onCancel: () => void;
}

export function InterviewView({ state, apiKey, drillQuestions, onComplete, onCancel }: InterviewViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [questionNum, setQuestionNum] = useState(0);
  const [currentResults, setCurrentResults] = useState<QuestionResult[]>([]);
  const [currentInterviewerIdx, setCurrentInterviewerIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentInterviewer = INTERVIEWERS.find(i => i.id === state.selectedInterviewers[currentInterviewerIdx]) || INTERVIEWERS[0];

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (questionNum > 0 && !isTyping) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questionNum, isTyping]);

  const startInterview = async () => {
    await askNextQuestion(1, 0);
  };

  const askNextQuestion = async (num: number, ivIdx: number) => {
    setIsTyping(true);
    setTimeLeft(120);
    const iv = INTERVIEWERS.find(i => i.id === state.selectedInterviewers[ivIdx]) || INTERVIEWERS[0];
    
    const conversationHistory = messages.map(m => `${m.role === 'interviewer' ? iv.name : 'Candidate'}: ${m.text}`).join('\n');
    const questionTotal = drillQuestions ? drillQuestions.length : state.questionCount;
    
    const panelContext = state.selectedInterviewers.length > 1 
      ? `This is a PANEL interview. The interviewers in the room are: ${state.selectedInterviewers.map(id => INTERVIEWERS.find(i => i.id === id)?.name).join(', ')}. Currently, ${iv.name} is leading the question.`
      : '';

    const resumeContext = state.resume 
      ? `Candidate Resume Context: ${state.resume.substring(0, 4000)}`
      : 'No resume provided.';

    const intelContext = state.companyIntel 
      ? `Deep Company Intelligence: ${state.companyIntel.substring(0, 1000)}`
      : '';

    const prompt = `
Context: ${state.jdAnalysis || state.jd.substring(0,600)}
Domain/Track: ${state.domainTrack}
${intelContext}
${resumeContext}
Candidate level: ${state.level}
Current Question: ${num} of ${questionTotal}
Interviewer leading: ${iv.name} (${iv.role})
${panelContext}

${conversationHistory ? `Conversation History:\n${conversationHistory}` : ''}

Ask question ${num}. Focus on challenges relevant to ${state.domainTrack}. Be conversational. Use the resume context to make questions person-specific if relevant.
${num === 1 ? 'Start with a brief greeting, then ask.' : ''}
${num === questionTotal ? 'This is the final question.' : ''}
`.trim();

    try {
      // Use gemini-1.5-flash for question generation
      const question = await callGemini(apiKey, prompt, iv.persona + '\nKeep it under 3 sentences.', 'gemini-1.5-flash');
      setMessages(prev => [...prev, { role: 'interviewer', text: question }]);
      setQuestionNum(num);
      setCurrentInterviewerIdx(ivIdx);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'interviewer', text: '⚠️ Signal Lost: ' + e.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  const improveAnswer = async () => {
    if (!input.trim() || isImproving || isTyping) return;
    setIsImproving(true);
    
    const lastQuestion = messages[messages.length - 1]?.text;
    const prompt = `
Question: "${lastQuestion}"
Candidate Draft: "${input}"
Role: ${state.candidatePersona} at ${state.level} level.

Rewrite this answer to be exceptional. Use STAR format where relevant. Keep it conversational. Return ONLY the improved answer text.
`.trim();

    try {
      // Use gemini-1.5-pro for "Thinking Mode" / Deep rewriting as requested
      const improved = await callGemini(apiKey, prompt, "You are a world-class interview coach. Transform the draft into a high-impact, professional response.", 'gemini-1.5-pro');
      setInput(improved);
    } catch (e) {
      console.error("Improvement error:", e);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isTyping) return;

    const answer = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'candidate', text: answer }]);
    setIsTyping(true);

    const lastQuestion = messages[messages.length - 1]?.text;

    try {
      const feedbackPrompt = `
Interviewer: ${currentInterviewer.name}
Question: "${lastQuestion}"
Answer: "${answer}"
Role: ${state.candidatePersona} (${state.level})

Provide brief feedback (2 sentences) and a SCORE:N (1-10).
`.trim();

      // Use gemini-1.5-pro for final synthesis/evaluation as requested
      const feedbackRaw = await callGemini(apiKey, feedbackPrompt, currentInterviewer.persona, 'gemini-1.5-pro');
      
      const scoreMatch = feedbackRaw.match(/SCORE:(\d+)/i);
      const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 6;
      const feedbackText = feedbackRaw.replace(/SCORE:\s*\d+/i, '').trim();

      const result: QuestionResult = { q: lastQuestion, a: answer, score, feedback: feedbackText };
      const newResults = [...currentResults, result];
      setCurrentResults(newResults);

      if (state.mode === 'practice') {
        setMessages(prev => [...prev, { role: 'interviewer', text: feedbackText, feedback: feedbackText, score }]);
      } else {
        setMessages(prev => [...prev, { role: 'interviewer', text: 'Evaluation captured. Next question initializing...' }]);
      }

      const totalQs = drillQuestions ? drillQuestions.length : state.questionCount;

      if (questionNum >= totalQs) {
        setTimeout(() => onComplete(newResults), 2000);
      } else {
        const nextIvIdx = (currentInterviewerIdx + 1) % state.selectedInterviewers.length;
        setTimeout(() => askNextQuestion(questionNum + 1, nextIvIdx), 1200);
      }
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'interviewer', text: '⚠️ Evaluation System Error: ' + e.message }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="screen-interview" className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      <header className="sticky top-0 z-40 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-6 p-6 flex items-center justify-between rounded-b-3xl">
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-white/5 shadow-2xl"
            style={{ backgroundColor: currentInterviewer.bg }}
          >
            {currentInterviewer.emoji}
          </div>
          <div>
            <div className="font-display font-extrabold italic text-stone-100 text-xl">{currentInterviewer.name}</div>
            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-black">{currentInterviewer.role}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="text-right">
            <div className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1 flex items-center justify-end gap-2">
              <Clock className="w-2 h-2" /> Simulation Time
            </div>
            <div className={`text-2xl font-mono font-bold tracking-tighter ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-stone-300'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5"></div>
          <div className="text-right">
            <div className="text-[9px] font-black text-stone-600 uppercase tracking-widest mb-1">Sequence Status</div>
            <div className="text-2xl font-display font-extrabold italic text-stone-400">
              <span className="text-accent">{questionNum}</span>
              <span className="text-stone-700 mx-1">/</span>
              <span>{drillQuestions ? drillQuestions.length : state.questionCount}</span>
            </div>
          </div>
          <div className="h-10 w-[1px] bg-white/5"></div>
          <button 
            onClick={onCancel}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all group"
            title="Emergency Stop"
          >
            <AlertCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[6px] font-black mt-1">ABORT</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-2 space-y-8 custom-scrollbar">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-400 ${m.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm border shadow-lg ${
              m.role === 'candidate' ? 'bg-accent border-accent text-black font-extrabold' : 'bg-surface-2 border-white/5'
            }`}>
              {m.role === 'candidate' ? 'YOU' : currentInterviewer.emoji}
            </div>
            <div className={`max-w-[80%] space-y-3 ${m.role === 'candidate' ? 'items-end flex flex-col' : ''}`}>
              <div className={`px-6 py-4 rounded-2xl text-sm leading-relaxed border shadow-xl ${
                m.role === 'candidate' 
                  ? 'bg-accent/10 border-accent/30 text-stone-100 italic font-medium' 
                  : 'bg-surface-1 border-white/5 text-stone-300'
              }`}>
                {m.text}
              </div>
              
              {m.feedback && state.mode === 'practice' && (
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border animate-in zoom-in-95 ${
                  m.score && m.score >= 7 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-accent/5 border-accent/20 text-accent'
                }`}>
                   <Sparkles className="w-3 h-3" />
                   Analytical Result: {m.score}/10
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm border bg-surface-2 border-white/5">
              {currentInterviewer.emoji}
            </div>
            <div className="bg-surface-1 border border-white/5 px-6 py-4 rounded-2xl">
              <div className="flex gap-2 items-center">
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-accent/40 rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="relative pt-4">
         <div className={`absolute top-0 left-6 -translate-y-full px-4 py-2 bg-accent/10 border border-accent/20 border-b-0 rounded-t-xl text-[9px] font-black uppercase tracking-widest text-accent z-10 flex items-center gap-2 transition-all duration-500 ${input.trim() ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
           <Sparkles className="w-3 h-3" /> Input Calibration Active
         </div>
        <div className="bg-surface-1 border border-white/5 rounded-3xl overflow-hidden focus-within:border-accent/40 transition-all shadow-2xl relative">
          <textarea
            className="w-full bg-transparent border-none text-stone-200 font-sans text-sm leading-relaxed p-6 pb-2 min-h-[140px] outline-none resize-none disabled:opacity-50 placeholder:text-stone-700"
            placeholder={isTyping ? "Calibrating systems..." : "Compose your response... (Cmd+Enter to submit)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between px-6 py-5 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                 <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest">
                   {isTyping ? 'SYSTEM_BUSY' : 'CORE_READY'}
                 </span>
               </div>
            </div>
            <div className="flex gap-4">
               <button
                onClick={improveAnswer}
                disabled={isTyping || isImproving || !input.trim()}
                className="bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-30 group"
              >
                {isImproving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 group-hover:scale-125 transition-transform" />}
                Improve Performance
              </button>
              <button
                className="bg-accent hover:bg-accent-light disabled:opacity-30 disabled:grayscale transition-all text-black px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-accent/10"
                onClick={handleSubmit}
                disabled={isTyping || !input.trim()}
              >
                Submit Records
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
