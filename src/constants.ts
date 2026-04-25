/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Interviewer } from './types';

export const INTERVIEWERS: Interviewer[] = [
  { 
    id: 'tech', 
    emoji: '💻', 
    color: '#6e57ff', 
    bg: 'rgba(110,87,255,0.15)', 
    name: 'Alex Chen', 
    role: 'Senior Engineer', 
    style: 'Technical',
    persona: 'You are Alex Chen, a senior software engineer. Ask focused technical questions: algorithms, system design, architecture decisions, debugging, performance trade-offs. Be precise and probe vague answers.' 
  },
  { 
    id: 'behavioral', 
    emoji: '🧠', 
    color: '#22c55e', 
    bg: 'rgba(34,197,94,0.12)', 
    name: 'Jordan Mills', 
    role: 'Eng Manager', 
    style: 'Behavioural',
    persona: 'You are Jordan Mills, an Engineering Manager. Ask STAR-method behavioural questions: leadership, conflict, failure, teamwork, pressure. Demand specific real examples.' 
  },
  { 
    id: 'hr', 
    emoji: '🤝', 
    color: '#f5a623', 
    bg: 'rgba(245,166,35,0.12)', 
    name: 'Priya Sharma', 
    role: 'HR Director', 
    style: 'Culture Fit',
    persona: 'You are Priya Sharma, HR Director. Assess culture fit, motivation, and self-awareness. Ask about career goals, work style, what drives them, feedback reception.' 
  },
  { 
    id: 'product', 
    emoji: '📦', 
    color: '#3b82f6', 
    bg: 'rgba(59,130,246,0.12)', 
    name: 'Marcus Lee', 
    role: 'Head of Product', 
    style: 'Product',
    persona: 'You are Marcus Lee, Head of Product. Ask about product sense, prioritisation frameworks, metrics, user empathy, and translating business needs into product decisions.' 
  },
  { 
    id: 'salary', 
    emoji: '💰', 
    color: '#f5a623', 
    bg: 'rgba(245,166,35,0.12)', 
    name: 'Daniel Ross', 
    role: 'Recruiter / Hiring Mgr', 
    style: 'Salary Negotiation',
    persona: 'You are Daniel Ross, a recruiter negotiating compensation. Act as the hiring side. Start with an offer. React realistically to the candidate\'s counter-arguments.' 
  },
];

export const DOMAIN_TRACKS = [
  'Full-Stack Engineering',
  'Backend Engineering',
  'Frontend Engineering',
  'Mobile (iOS/Android)',
  'Data Engineering',
  'Machine Learning',
  'System Design',
  'Cloud & SRE',
  'Cybersecurity',
  'Embedded Systems',
  'Product Management',
  'Data Science'
];

export const COMPANIES: Record<string, { tip: string, lp: string[], pattern?: string[] }> = {
  Google:    { 
    tip:'Focus on scalability, clean code, and data-driven decisions. Googleyness matters.', 
    lp:[], 
    pattern: ['Recruiter Screen', 'Technical Phone Screen (LeetCode)', 'Onsite: 3 Coding, 1 System Design, 1 Googleyness'] 
  },
  Meta:      { 
    tip:'Emphasise speed, impact at scale, and product sense. "Move fast" culture.', 
    lp:[], 
    pattern: ['Initial Screen', 'Coding (Product/Systems)', 'Onsite: 2 Coding, 1 System Design, 1 Behavioural'] 
  },
  Target:    { 
    tip:'Focus on Omni-channel retail scale, strong collaboration, and inclusivity. Be ready for "Guest-first" logic.', 
    lp:['Guest-centric','Teamwork','Innovation','Inclusion'],
    pattern: ['Recruiter Sync', 'Hiring Manager Call (Technical/Behavioral)', 'Technical Loop (Karat/Live Coding)', 'Values & System Design Panel'] 
  },
  Amazon:    { 
    tip:'Structure every answer around the 16 Leadership Principles.', 
    lp:['Customer Obsession','Ownership','Invent & Simplify','Bias for Action','Earn Trust','Deliver Results'],
    pattern: ['Online Assessment', 'Phone Interview', 'The Loop: 4-5 Rounds with Bar Raiser']
  },
  Apple:     { tip:'Demonstrate craftsmanship, attention to detail, and cross-functional collaboration.', lp:[] },
  Microsoft: { 
    tip: 'Growth mindset, collaboration, and clarity of communication are central.', 
    lp: ['Customer Obsession', 'Diverse Perspectives', 'Growth Mindset', 'Making a Difference'],
    pattern: ['Recruiter Screen', 'Technical Screen', 'Onsite Loop: Coding, System Design, Behavioral (AA Round)']
  },
  Adobe:     { tip: 'Focus on creativity, customer experience, and digital transformation.', lp: [] },
  NVIDIA:    { tip: 'Hard-core engineering, CUDA knowledge (usually), and problem solving under pressure.', lp: [] },
  Tesla:     { tip: 'Focus on first principles, high-speed iteration, and hardware/software integration.', lp: ['First Principles', 'High Speed', 'Extreme Ownership'] },
  Netflix:   { tip: 'Senior-only culture — show independent judgment, context over control.', lp: [] },
  Stripe:    { tip:'Show rigorous thinking, user empathy, and comfort with ambiguity.', lp:[] },
  OpenAI:    { tip:'Research depth, safety awareness, and ambition to solve hard problems.', lp:[] },
  Startup:   { tip:'Show scrappiness, versatility, and speed. Generalist wins here.', lp:[] },
  None:      { tip:'', lp:[] }
};
