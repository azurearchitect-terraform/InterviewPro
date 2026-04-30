/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home, LayoutDashboard, Map, Library, ChevronRight } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  hasStarted: boolean;
}

export function Layout({ children, currentScreen, onNavigate, hasStarted }: LayoutProps) {
  const navItems = [
    { id: Screen.HOME, label: 'Home', icon: <Home className="w-4 h-4" />, alwaysShow: true },
    { id: Screen.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, alwaysShow: false },
    { id: Screen.ROADMAP, label: 'Learning Roadmap', icon: <Map className="w-4 h-4" />, alwaysShow: false },
    { id: Screen.KNOWLEDGE_BASE, label: 'Knowledge Base', icon: <Library className="w-4 h-4" />, alwaysShow: false },
  ];

  return (
    <div className="flex min-h-screen bg-bg text-stone-100">
      {/* Sidebar - only show if not on Home screen or if sessions have started */}
      <aside className="w-64 bg-surface-1 border-r border-white/[0.05] hidden md:flex flex-col shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-black font-black shadow-[0_0_15px_rgba(139,116,255,0.4)]">C</div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-black text-white">INTERVIEW_AUDITOR</span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const show = item.alwaysShow || hasStarted;
              if (!show) return null;
              
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold transition-all rounded-xl group relative overflow-hidden ${
                    isActive 
                      ? 'text-white border border-white/10 bg-accent/10 shadow-[inset_0_0_20px_rgba(139,116,255,0.05)]' 
                      : 'text-stone-400 hover:text-stone-100 hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className={`${isActive ? 'text-accent' : 'text-stone-500 group-hover:text-accent/60 transition-colors'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                  {isActive && <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-accent rounded-full shadow-[0_0_8px_rgba(139,116,255,0.8)]" />}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-stone-400 group hover:border-accent/40 transition-all cursor-default">CE</div>
            <div>
              <p className="text-[12px] font-black text-white uppercase tracking-tight">Active Protocol</p>
              <p className="text-[9px] text-stone-500 uppercase tracking-widest font-medium">status_optimal</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-bg relative overflow-y-auto">
        {/* Mobile Header (minimal) */}
        <div className="md:hidden p-4 border-b border-white/5 flex items-center justify-between">
          <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-black font-bold text-xs">C</div>
          <button 
             className="text-stone-500 text-[10px] uppercase tracking-widest"
             onClick={() => onNavigate(Screen.HOME)}
          >
            Menu
          </button>
        </div>
        
        <div className="flex-1">
          {children}
        </div>

        {/* Global Footer */}
        <footer className="h-12 bg-surface-1/50 backdrop-blur-sm border-t border-white/[0.03] flex items-center px-10 justify-between">
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2 text-stone-500">
               <div className="w-1.5 h-1.5 bg-success rounded-full opacity-50" />
               SYSTEM: <span className="text-stone-300">ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
               CORE: <span className="text-stone-300">CLOUD_NEURAL_v4.5</span>
            </div>
            <div className="flex items-center gap-2 text-stone-500">
               ENCRYPTION: <span className="text-accent underline decoration-accent/20">AES_ACTIVE</span>
            </div>
          </div>
          <div className="text-[10px] text-stone-600 font-mono font-bold tracking-widest bg-white/[0.02] px-3 py-1 rounded border border-white/[0.03]">
            SEQ_ID: <span className="text-stone-400 italic">IK-31-FLASH-PR</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
