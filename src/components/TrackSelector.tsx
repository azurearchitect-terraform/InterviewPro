/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layers, ChevronRight } from 'lucide-react';
import { DOMAIN_TRACKS } from '../constants';

interface TrackSelectorProps {
  currentTrack: string;
  onSelect: (track: string) => void;
}

export function TrackSelector({ currentTrack, onSelect }: TrackSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Layers className="w-4 h-4 text-stone-500" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Domain Specialization</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {DOMAIN_TRACKS.map((track) => (
          <button
            key={track}
            onClick={() => onSelect(track)}
            className={`p-3 text-left transition-all border rounded-xl flex items-center justify-between group ${
              currentTrack === track 
                ? 'bg-accent/10 border-accent/40 text-accent-light px-4' 
                : 'bg-black/20 border-white/5 text-stone-500 hover:border-white/10 hover:bg-white/[0.02]'
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-all ${
                currentTrack === track ? 'translate-x-1' : 'group-hover:translate-x-0.5'
              }`}>{track}</span>
              {currentTrack === track && (
                <span className="text-[8px] text-accent/60 font-mono mt-0.5 uppercase">SYSTEM_ADAPTED</span>
              )}
            </div>
            {currentTrack === track ? (
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(129,140,248,1)]"></div>
            ) : (
              <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
