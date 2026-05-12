/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Send, User, ChevronRight, AlertCircle, Mic, MicOff, Lightbulb, Sparkles, Clock, ArrowLeft, RotateCcw, Volume2, Play, Square, Shield, Maximize, Minimize } from 'lucide-react';
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
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hintLevel, setHintLevel] = useState(0); // 0: none, 1: hint, 2: solution
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [showAbortModal, setShowAbortModal] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const recognition = useRef<any>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isFaang = state.company === 'FAANG';

  const currentInterviewer = INTERVIEWERS.find(i => i.id === state.selectedInterviewers[currentInterviewerIdx]) || INTERVIEWERS[0];

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const startInterview = async () => {
    await askNextQuestion(1, 0);
  };

  const startRecording = async () => {
    try {
      setTranscription('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];
      mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      mediaRecorder.current.start();
      setIsRecording(true);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognition.current = new SpeechRecognition();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setTranscription(transcript);
          setInput(transcript); // Update input field as we speak
        };
        recognition.current.start();
      }
    } catch (err) {
      console.error("Recording/Speech error:", err);
      alert("Microphone access needed for recording/transcription.");
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
    if (recognition.current) {
        recognition.current.stop();
    }
  };

  const detectFillers = (text: string) => {
    const fillers = ['um', 'uh', 'like', 'actually', 'basically', 'you know', 'i mean', 'so yeah'];
    const words = text.toLowerCase().split(/\s+/);
    const count = words.filter(w => fillers.includes(w)).length;
    return {
      count,
      confidence: Math.max(0, 100 - (count * 5))
    };
  };

  const getHint = async () => {
    if (isTyping || isGettingHint || hintLevel >= 2) return;
    setIsGettingHint(true);
    
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer')?.text;
    const currentLevel = hintLevel + 1;
    
    const prompt = `
Question: "${lastQuestion}"
Requirement: Provide ${currentLevel === 1 ? 'a subtle hint' : 'a full conceptual solution outline'} for this question.
Context: Candidate is applying for ${state.domainTracks.join(', ')} at ${state.level} level.
Return only the response text.
`.trim();

    try {
      const hintRes = await callGemini(apiKey, prompt, "You are a helpful interviewer providing tiered guidance.", 'gemini-1.5-flash');
      setMessages(prev => [...prev, { role: 'interviewer', text: (currentLevel === 1 ? '💡 Hint: ' : '🔑 Solution Strategy: ') + hintRes }]);
      setHintLevel(currentLevel);
    } catch (e) {
      console.error("Hint error:", e);
    } finally {
      setIsGettingHint(false);
    }
  };

  const flipPerspective = async () => {
    if (isTyping || isFlipping) return;
    setIsFlipping(true);
    
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer')?.text;
    
    const prompt = `
Interviewer Question: "${lastQuestion}"
Requirement: Explain the "Interviewer Perspective" - why are they asking this? What is the hidden agenda? What "Red Flags" are they looking for?
Return only 3 short bullet points.
`.trim();

    try {
      const flipRes = await callGemini(apiKey, prompt, "You are a fly on the wall in the hiring committee meeting. Reveal the hidden motives.", 'gemini-1.5-flash');
      setMessages(prev => [...prev, { role: 'interviewer', text: '🕵️ Interviewer Internal Agenda: \n' + flipRes }]);
    } catch (e) {
      console.error("Flip error:", e);
    } finally {
      setIsFlipping(false);
    }
  };

  useEffect(() => {
    startInterview();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (questionNum > 0 && !isTyping && !isPaused) {
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
  }, [questionNum, isTyping, isPaused]);

  const askNextQuestion = async (num: number, ivIdx: number) => {
    setIsTyping(true);
    setTimeLeft(120);
    setHintLevel(0);
    setAudioURL(null);
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

    const faangInstructions = `
You are a FAANG-level interviewer from companies like Meta, Amazon, Google, Apple, and Netflix.
Your role is to conduct a realistic interview for a ${state.level} ${state.domainTracks.join(' / ')} candidate.

Follow this strict interview structure:
1. Start with a brief introduction as the interviewer.
2. Ask ONE question at a time (do not ask multiple questions together).
3. Wait for the candidate’s answer before proceeding.
4. Adapt the next question based on the candidate’s previous answer.
5. Maintain high standards (FAANG bar).

INTERVIEW FLOW:
- Round 1: System Design (High Priority) - Ask large-scale architecture problems (multi-region, HA/DR, cost optimization). Expect structured answers (components, trade-offs, failure handling).
- Round 2: Troubleshooting Scenario - Simulate real production issues (outages, latency, misconfigurations). Ask step-by-step debugging approach.
- Round 3: Cloud Architecture Deep Dive (Azure focus if applicable).
- Round 4: Behavioral (Leadership & Ownership) - Ask “Tell me about a time…” questions. Evaluate leadership, ownership, decision-making.

ADVANCED EVALUATION CRITERIA:
- Depth of Knowledge (Did candidate go beyond surface?)
- Trade-off Awareness (Did they compare approaches?)
- Scalability Thinking (Handled millions of users?)
- Failure Handling (What happens when things break?)
- Cost Awareness (Cloud optimization mindset)

Weight Distribution: System Design: 40%, Troubleshooting: 25%, Behavioral: 20%, Communication: 15%.

TONE: Professional, slightly challenging. No hints unless candidate is completely stuck.
`.trim();

    const prompt = `
Context: ${state.jdAnalysis || state.jd.substring(0,600)}
Domain/Track: ${state.domainTracks.join(', ')}
${intelContext}
${resumeContext}
Candidate level: ${state.level}
Current Question: ${num} of ${questionTotal}
Interviewer leading: ${iv.name} (${iv.role})
${panelContext}
${isFaang ? faangInstructions : ''}

${conversationHistory ? `Conversation History:\n${conversationHistory}` : ''}

Ask question ${num}. Focus on challenges relevant to ${state.domainTracks.join(', ')}. Be conversational. Use the resume context to make questions person-specific if relevant.
${num === 1 ? 'Start with a brief greeting, then ask.' : ''}
${num === questionTotal ? 'This is the final question.' : ''}
`.trim();

    try {
      const question = await callGemini(apiKey, prompt, (isFaang ? 'You are a FAANG Interviewer. Follow rules strictly.' : iv.persona) + '\nKeep it under 4 sentences.', 'gemini-1.5-flash');
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
    
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer')?.text;
    const prompt = `
Question: "${lastQuestion}"
Candidate Draft: "${input}"
Role: ${state.candidatePersona} at ${state.level} level.

Rewrite this answer to be exceptional. Use STAR format where relevant. Keep it conversational. Return ONLY the improved answer text.
`.trim();

    try {
      const improved = await callGemini(apiKey, prompt, "You are a world-class interview coach. Transform the draft into a high-impact, professional response.", 'gemini-1.5-pro');
      setInput(improved);
    } catch (e) {
      console.error("Improvement error:", e);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isTyping || isPaused) return;

    const answer = input.trim();
    const fillerStats = detectFillers(answer);
    
    setInput('');
    setMessages(prev => [...prev, { role: 'candidate', text: answer }]);
    setIsTyping(true);

    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer')?.text;

    try {
      const styleInstruction = {
        direct: "FEEDBACK TONE: Direct and critical. Be brutally honest, point out every flaw, and don't sugarcoat.",
        constructive: "FEEDBACK TONE: Encouraging and constructive. Focus on growth, highlighting both strengths and actionable improvements.",
        neutral: "FEEDBACK TONE: Neutral and objective. Maintain an impartial, fact-based response without emotional bias."
      }[state.feedbackStyle] || "FEEDBACK TONE: Constructive.";

      const faangFeedbackInstruction = `
SCORING MODEL (FAANG BAR):
After each answer, evaluate using:
- Problem Solving (0-10)
- System Design Thinking (0-10)
- Communication Clarity (0-10)
- Real-world Experience (0-10)

Also provide:
- Strengths
- Weaknesses
- What a FAANG-level answer should include

At the end of the full interview:
- Give final score out of 100
- Give Hire / No Hire decision
- Provide improvement roadmap
`.trim();

      const feedbackPrompt = `
Interviewer: ${currentInterviewer.name}
Question: "${lastQuestion}"
Answer: "${answer}"
Role: ${state.candidatePersona} (${state.level})
${isFaang ? faangFeedbackInstruction : styleInstruction}
Filler Words Count: ${fillerStats.count} (Detected: Um, Uh, Like, etc.)

Provide brief feedback ${isFaang ? '(FAANG style)' : '(2 sentences)'} and a SCORE:N (1-10 or 1-100 depending on complexity). Include analysis of confidence and filler words if relevant.
`.trim();

      const feedbackRaw = await callGemini(apiKey, feedbackPrompt, isFaang ? "You are a demanding FAANG Bar Raiser." : currentInterviewer.persona, 'gemini-1.5-pro');
      
      const scoreMatch = feedbackRaw.match(/SCORE:(\d+)/i);
      const score = scoreMatch ? Math.min(10, Math.max(1, parseInt(scoreMatch[1]))) : 6;
      const feedbackText = feedbackRaw.replace(/SCORE:\s*\d+/i, '').trim();

      const result: QuestionResult = { q: lastQuestion || '', a: answer, score, feedback: feedbackText };
      const newResults = [...currentResults, result];
      setCurrentResults(newResults);

      if (state.mode === 'practice') {
        const fillerFeedback = fillerStats.count > 3 ? ` | Confidence Impact: -${fillerStats.count}% due to fillers.` : '';
        setMessages(prev => [...prev, { 
          role: 'interviewer', 
          text: feedbackText, 
          feedback: feedbackText + fillerFeedback, 
          score 
        }]);
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
    <div id="screen-interview" className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-100px)] relative">
      {state.company === 'FAANG' && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-2 duration-700">
           <div className="px-4 py-1.5 bg-accent/20 border border-accent/40 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-accent backdrop-blur-md flex items-center gap-2 shadow-2xl">
              <Shield className="w-3 h-3" /> FAANG_BAR_RAISER_ACTIVE
           </div>
        </div>
      )}
      {/* Abort Modal Overlay */}
      {showAbortModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-surface-1 border border-white/10 rounded-3xl p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-danger/10 border border-danger/20 rounded-2xl flex items-center justify-center mx-auto">
                 <AlertCircle className="w-10 h-10 text-danger animate-pulse" />
              </div>
              <div className="text-center space-y-3">
                 <h2 className="text-2xl font-display font-black italic text-white uppercase tracking-tighter">Emergency Abort?</h2>
                 <p className="text-stone-400 text-sm leading-relaxed">
                    You are about to terminate the simulation. All neural calibration and captured metrics will be purged from the current buffer.
                 </p>
              </div>
              <div className="flex flex-col gap-3">
                 <button 
                   onClick={() => {
                     setShowAbortModal(false);
                     onCancel();
                   }}
                   className="w-full py-4 bg-danger text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-danger-light transition-all shadow-xl shadow-danger/20"
                 >
                   Confirm Termination
                 </button>
                 <button 
                   onClick={() => setShowAbortModal(false)}
                   className="w-full py-4 bg-surface-2 border border-white/5 text-stone-400 font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:text-white transition-all"
                 >
                   Resume Simulation
                 </button>
              </div>
           </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-white/[0.05] mb-4 p-3 flex items-center justify-between rounded-b-3xl shadow-2xl">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setShowAbortModal(true)}
             className="p-2 bg-surface-2 border border-white/10 rounded-xl text-stone-500 hover:text-accent hover:border-accent/40 transition-all group"
           >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border border-white/10 shadow-2xl inner-border"
                style={{ backgroundColor: currentInterviewer.bg }}
              >
                {currentInterviewer.emoji}
              </div>
              <div className="flex flex-col">
                <div className="font-display font-black italic text-white text-base tracking-tight uppercase leading-none mb-1">{currentInterviewer.name}</div>
                <div className="flex items-center gap-2">
                  <div className="text-[8px] text-stone-400 uppercase tracking-[0.2em] font-black bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.02]">{currentInterviewer.role}</div>
                  <div className="h-2.5 w-[1px] bg-white/10"></div>
                  <div className="text-[9px] text-stone-400 italic font-medium truncate max-w-[150px] md:max-w-[300px]">{currentInterviewer.persona.split('.')[0]}.</div>
                </div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border bg-surface-2 border-white/10 text-stone-300 hover:text-white"
           >
             {isFullscreen ? <Minimize className="w-3 h-3" /> : <Maximize className="w-3 h-3" />}
             {isFullscreen ? 'EXIT_FULLSCREEN' : 'FULLSCREEN'}
           </button>
           <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                isPaused ? 'bg-accent text-white border-accent' : 'bg-surface-2 border-white/10 text-stone-300'
              }`}
           >
             {isPaused ? 'RESUME_SIMULATION' : 'PAUSE_SIMULATION'}
           </button>
           <div className="h-8 w-[1px] bg-white/[0.05]"></div>
           <div className="text-right">
            <div className="text-[8px] font-black text-stone-600 uppercase tracking-[0.2em] mb-0.5 flex items-center justify-end gap-1">
              <Clock className="w-2.5 h-2.5 text-accent" /> simulation_clock
            </div>
            <div className={`text-lg font-mono font-black tracking-tighter ${timeLeft < 30 ? 'text-danger animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/[0.05]"></div>
          <div className="text-right">
            <div className="text-[8px] font-black text-stone-600 uppercase tracking-[0.2em] mb-0.5">sequence_pos</div>
            <div className="text-lg font-display font-black italic text-stone-300">
              <span className="text-accent underline decoration-accent/20 underline-offset-4">{questionNum}</span>
              <span className="text-stone-700 mx-1.5 text-xs">/</span>
              <span className="text-stone-500">{drillQuestions ? drillQuestions.length : state.questionCount}</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-white/[0.05]"></div>
          <button 
            onClick={() => setShowAbortModal(true)}
            className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-danger/5 border border-danger/20 text-danger hover:bg-danger hover:text-white transition-all group shadow-lg shadow-danger/5"
            title="Emergency Abort"
          >
            <AlertCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[5px] font-black mt-0.5 tracking-tighter">ABORT</span>
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
            <div className={`max-w-[85%] space-y-2 ${m.role === 'candidate' ? 'items-end flex flex-col' : ''}`}>
              <div className={`px-5 py-4 rounded-2xl text-base leading-relaxed border shadow-xl ${
                m.role === 'candidate' 
                  ? 'bg-accent/10 border-accent/30 text-white italic font-medium' 
                  : 'bg-surface-1 border-white/10 text-stone-100'
              }`}>
                {m.text}
              </div>
              
              {m.score !== undefined && state.mode === 'practice' && (
                <div className="flex flex-col gap-1.5 scale-in group">
                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border animate-in zoom-in-95 ${
                    m.score && m.score >= 7 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-accent/5 border-accent/20 text-accent'
                   }`}>
                      <Sparkles className="w-3 h-3" />
                      Analytical Result: {m.score}/10
                   </div>
                   {m.feedback && (
                      <div className="bg-black/20 border border-white/5 rounded-xl p-3 text-[10px] text-stone-500 italic max-w-sm">
                         {m.feedback}
                      </div>
                   )}
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
        {audioURL && (
           <div className="absolute top-0 right-6 -translate-y-full px-4 py-2 bg-blue-500/10 border border-blue-500/20 border-b-0 rounded-t-xl text-[9px] font-black uppercase tracking-widest text-blue-400 z-10 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-1">
              <Volume2 className="w-3 h-3" /> Audio Record Captured
              <button 
                onClick={() => { const audio = new Audio(audioURL); audio.play(); }}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Play className="w-2.5 h-2.5" /> Playback
              </button>
           </div>
        )}
         <div className={`absolute top-0 left-6 -translate-y-full px-4 py-2 bg-accent/10 border border-accent/20 border-b-0 rounded-t-xl text-[9px] font-black uppercase tracking-widest text-accent z-10 flex items-center gap-2 transition-all duration-500 ${input.trim() ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
           <Sparkles className="w-3 h-3" /> Input Calibration Active
         </div>
         <div className="bento-card p-1 shadow-2xl overflow-hidden focus-within:border-accent/40 transition-all relative">
          <textarea
            className="w-full bg-transparent border-none text-stone-100 font-sans text-base leading-relaxed p-6 pb-2 min-h-[90px] outline-none resize-none disabled:opacity-50 placeholder:text-stone-700 font-medium"
            placeholder={isTyping ? "AWAITING_SYSTEM_CALIBRATION..." : "Compose tactical response... (Cmd/Ctrl+Enter to deploy)"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between px-8 py-6 border-t border-white/[0.05] bg-black/40">
            <div className="flex items-center gap-6">
                <button
                   onClick={isRecording ? stopRecording : startRecording}
                   className={`p-4 rounded-2xl border transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest ${
                     isRecording 
                        ? 'bg-danger text-white border-danger shadow-lg shadow-danger/20 animate-pulse' 
                        : 'bg-surface-2 border-white/10 text-stone-400 hover:border-white/20 hover:text-white shadow-xl'
                   }`}
                >
                   {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
                   {isRecording ? 'HALT_RECORD' : 'RECV_AUDIO'}
                </button>
                <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] ${isTyping ? 'bg-amber-500 animate-pulse' : 'bg-success'}`}></div>
                  <span className="text-[10px] font-mono text-stone-500 uppercase tracking-[0.2em] font-black">
                    {isTyping ? 'SYSTEM_BUSY' : 'CORE_READY'}
                  </span>
                </div>
            </div>
            <div className="flex gap-4">
              {isFaang && (
                <div className="hidden lg:flex flex-col items-end justify-center mr-2">
                   <div className="text-[7px] font-black text-accent uppercase tracking-widest">Bar_Raiser</div>
                   <div className="text-[10px] font-black text-white italic">FAANG_GRADE</div>
                </div>
              )}
              <button
                onClick={getHint}
                  disabled={isTyping || isGettingHint || hintLevel >= 2}
                  className="bg-surface-2 hover:bg-surface-3 border border-white/10 text-stone-300 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all disabled:opacity-20 shadow-xl"
                >
                  {isGettingHint ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4 text-gold" />}
                  {hintLevel === 0 ? 'HINT_01' : hintLevel === 1 ? 'DECIPHER' : 'SOLVED'}
                </button>
                
                <button
                  onClick={improveAnswer}
                  disabled={isTyping || isImproving || !input.trim()}
                  className="bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2.5 transition-all disabled:opacity-30 group shadow-xl"
                >
                  {isImproving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-125 transition-transform" />}
                  CALIBRATE
                </button>
                
                <button
                  className={`px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-2xl relative overflow-hidden group ${
                    isTyping || !input.trim() 
                      ? 'bg-stone-800 text-stone-600 cursor-not-allowed opacity-50' 
                      : 'bg-accent text-white hover:scale-[1.02] shadow-accent/20'
                  }`}
                  onClick={handleSubmit}
                  disabled={isTyping || !input.trim()}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                  SUBMIT_RECORDS
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
