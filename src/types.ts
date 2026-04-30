/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Screen {
  HOME = 'home',
  INTERVIEWER_SELECTION = 'interviewers',
  INTERVIEW = 'interview',
  RESULTS = 'results',
  DASHBOARD = 'dashboard',
  ROADMAP = 'roadmap',
  KNOWLEDGE_BASE = 'knowledge_base',
  MCQ = 'mcq',
  INTEL = 'intel',
  QUIZ = 'quiz',
  EVOLUTION = 'evolution',
  SALARY = 'salary',
  PATTERNS = 'patterns',
  GUIDE = 'guide',
  QUESTION_BANK = 'question_bank',
  FLASHCARDS = 'flashcards',
}

export type RoleLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type InterviewMode = 'practice' | 'real' | 'salary';
export type FeedbackStyle = 'direct' | 'constructive' | 'neutral';
export type CandidatePersona = string;

export interface Interviewer {
  id: string;
  emoji: string;
  color: string;
  bg: string;
  name: string;
  role: string;
  style: string;
  persona: string;
}

export interface Message {
  role: 'interviewer' | 'candidate';
  text: string;
  feedback?: string;
  score?: number;
  hint?: string;
  senderName?: string;
}

export interface QuestionResult {
  q: string;
  a: string;
  score: number;
  feedback: string;
}

export interface SkillRating {
  name: string;
  rating: number; // 0-100
  trend: 'up' | 'down' | 'steady';
}

export interface RoadmapItem {
  category: string;
  topic: string;
  status: 'todo' | 'learning' | 'mastered';
  importance: 'high' | 'medium' | 'low';
  week?: number;
}

export interface MCQQuestion {
  q: string;
  opts: { l: string; t: string }[];
  ans: string;
  exp: string;
}

export interface MCQSession {
  topic: string;
  difficulty: string;
  questions: MCQQuestion[];
  score: number;
}

export interface HistoryItem {
  date: string;
  score: number;
  type: 'interview' | 'mcq' | 'quiz' | 'intel';
  label?: string;
}

export interface AppState {
  jd: string;
  company?: string;
  level: RoleLevel;
  mode: InterviewMode;
  feedbackStyle: FeedbackStyle;
  candidatePersona: CandidatePersona;
  resume: string | null;
  jdAnalysis: string;
  selectedInterviewers: string[];
  questionCount: number;
  currentInterviewerIndex: number;
  messages: Message[];
  questionNum: number;
  results: QuestionResult[];
  // Cloud Engineering persistent state
  skills: SkillRating[];
  roadmap: RoadmapItem[];
  history: HistoryItem[];
  mcqSession?: MCQSession;
  companyIntel: string | null;
  domainTracks: string[];
  customDomains: string[];
  yearsExperience: number;
  currentSalary: string;
  currency: string;
  location: {
    country: string;
    city: string;
  };
}
