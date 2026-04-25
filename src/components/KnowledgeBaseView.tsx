/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Library, Search, ChevronRight, BookOpen, HardDrive, Shield, Network, RefreshCw, ArrowLeft } from 'lucide-react';
import { AppState, Screen } from '../types';
import { callGemini } from '../services/gemini';
import Markdown from 'react-markdown';

interface KnowledgeBaseViewProps {
  state: AppState;
  apiKey: string;
  onNavigate: (screen: Screen) => void;
}

export function KnowledgeBaseView({ state, apiKey, onNavigate }: KnowledgeBaseViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const topics = [
    { id: 'terraform', label: 'Terraform State Management', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'k8s_security', label: 'K8s RBAC & Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'hybrid_net', label: 'Hybrid Cloud Networking', icon: <Network className="w-4 h-4" /> },
    { id: 'disaster_recovery', label: 'Multi-Region DR Architectures', icon: <RefreshCw className="w-4 h-4" /> },
  ];

  const fetchContent = async (topicId: string, topicLabel: string) => {
    if (!apiKey) return;
    setLoading(true);
    setSelectedTopic(topicId);
    setContent(null);
    
    try {
      const prompt = `
Generate a high-level "Cloud Engineer Playbook" for the topic: "${topicLabel}".
Structure it for someone preparing for a Senior Cloud Engineering interview.
Include:
1. Core Principles
2. Common Pitfalls / Anti-patterns
3. "Expert-level" Interview Answer Snippets (Mental Models)
4. Architecture Diagram Ideas (Textual description)

Keep it professional, technical, and concise. Use Markdown.
`;

      const response = await callGemini(apiKey, prompt, "You are a Principal Cloud Architect at a FAANG company. Provide world-class technical insights.", 'gemini-3.1-pro-preview');
      setContent(response);
    } catch (e) {
      console.error("Knowledge base error:", e);
      setContent("Error fetching content. Please verify your API key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 animate-in fade-in duration-700">
      {/* Sidebar - Topics */}
      <div className="lg:col-span-4 space-y-8">
        <header className="sticky top-16 z-40 -mx-4 px-4 py-8 bg-bg/80 backdrop-blur-md border-b border-white/5 mb-8 flex items-center gap-6">
           <button 
             onClick={() => onNavigate(Screen.DASHBOARD)}
             className="p-3 bg-surface-1 border border-white/5 rounded-xl text-stone-500 hover:text-accent transition-all group"
           >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
           </button>
           <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-accent mb-1">Central Archive</p>
              <h1 className="font-serif italic text-3xl text-stone-100">Knowledge Base</h1>
           </div>
        </header>

        <div className="relative space-y-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-stone-600" />
          <input 
            type="text" 
            placeholder="Search Playbooks..." 
            className="w-full bg-surface border border-white/5 py-3 pl-10 pr-4 text-[10px] uppercase tracking-widest placeholder:text-stone-700 outline-none focus:border-accent/30 transition-colors"
          />
        </div>

        <nav className="space-y-1">
          {topics.map((t) => (
            <button
              key={t.id}
              onClick={() => fetchContent(t.id, t.label)}
              className={`w-full flex items-center gap-4 px-6 py-5 border group transition-all text-left ${
                selectedTopic === t.id 
                  ? 'bg-accent/5 border-accent/20 text-stone-100' 
                  : 'bg-surface border-white/5 text-stone-500 hover:text-stone-300 hover:border-white/10'
              }`}
            >
              <span className={selectedTopic === t.id ? 'text-accent' : 'text-stone-700 group-hover:text-stone-500'}>
                {t.icon}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-widest flex-1">{t.label}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${selectedTopic === t.id ? 'rotate-90 text-accent' : 'opacity-20'}`} />
            </button>
          ))}
        </nav>
        
        <div className="bg-surface/50 border border-dashed border-white/5 p-6 space-y-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-stone-700" />
            <span className="text-[9px] uppercase tracking-widest text-stone-600 font-black">AI Curation Note</span>
          </div>
          <p className="text-[10px] text-stone-500 leading-relaxed italic">
            These playbooks are dynamically generated based on current Cloud Engineering standards (April 2024).
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="lg:col-span-8 min-h-[600px] border border-white/5 bg-black/40 p-10 relative overflow-hidden">
        {!selectedTopic ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20">
            <Library className="w-16 h-16 mb-6" />
            <p className="text-[10px] uppercase tracking-[0.4em]">Select a Playbook to Decrypt</p>
          </div>
        ) : loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-2 border-stone-800 border-t-accent rounded-full animate-spin" />
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone-600 animate-pulse">Sourcing Architectural Intelligence...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-10 pb-8 border-b border-white/5">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></span>
                <span className="text-[10px] uppercase tracking-widest text-accent font-black">Classified Architecture Playbook</span>
              </div>
              <h2 className="font-serif italic text-4xl text-stone-100">
                {topics.find(t => t.id === selectedTopic)?.label}
              </h2>
            </header>
            
            <div className="markdown-body prose prose-invert prose-stone max-w-none prose-sm prose-headings:font-serif prose-headings:italic prose-headings:text-accent-light prose-strong:text-accent text-stone-400">
              <Markdown>{content || ''}</Markdown>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center text-[9px] uppercase tracking-widest text-stone-700 font-mono">
              <span>Source: Gemini 3.1 Pro Knowledge Archive</span>
              <span>Sequence: PLAYBOOK_{selectedTopic?.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Tactical Accents */}
        <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-accent/5 m-4"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-accent/5 m-4"></div>
      </div>
    </div>
  );
}
