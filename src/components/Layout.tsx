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
    <div className="flex min-h-screen bg-bg text-stone-200">
      {/* Sidebar - only show if not on Home screen or if sessions have started */}
      <aside className="w-64 bg-surface border-r border-white/5 hidden md:flex flex-col">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-black font-bold">C</div>
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-white">Cloud Master</span>
          </div>
          
          <nav className="space-y-1">
            {navItems.map((item) => {
              const show = item.alwaysShow || hasStarted;
              if (!show) return null;
              
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all rounded-none group ${
                    isActive 
                      ? 'text-accent border-r-2 border-accent bg-accent/5' 
                      : 'text-stone-400 hover:text-stone-100 hover:bg-white/5'
                  }`}
                >
                  <span className={`${isActive ? 'text-accent' : 'text-stone-500 group-hover:text-stone-300'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                  {isActive && <ChevronRight className="w-3 h-3 ml-auto opacity-50" />}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-none bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] font-bold">CE</div>
            <div>
              <p className="text-[11px] font-semibold text-white">Cloud Engineer</p>
              <p className="text-[9px] text-stone-500 uppercase tracking-widest">Active Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#0d0d0d] relative overflow-y-auto">
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
        <footer className="h-10 bg-black border-t border-white/5 flex items-center px-10 justify-between">
          <div className="flex gap-6 text-[9px] uppercase tracking-widest text-stone-600">
            <span>System: Online</span>
            <span>Mode: Cloud Engineering</span>
            <span>Security: Active</span>
          </div>
          <div className="text-[9px] text-stone-600 font-mono">
            REF: IK-31-FLASH-PR
          </div>
        </footer>
      </main>
    </div>
  );
}
