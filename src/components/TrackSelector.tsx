/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Layers, ChevronRight, Plus, X } from 'lucide-react';
import { DOMAIN_TRACKS } from '../constants';

interface TrackSelectorProps {
  currentTracks: string[];
  customDomains: string[];
  onUpdateTracks: (tracks: string[], custom: string[]) => void;
}

export function TrackSelector({ currentTracks, customDomains, onUpdateTracks }: TrackSelectorProps) {
  const [newCustom, setNewCustom] = useState('');

  const allAvailable = [...DOMAIN_TRACKS].sort().concat([...customDomains].sort());

  const toggleTrack = (track: string) => {
    const isSelected = currentTracks.includes(track);
    const updated = isSelected 
      ? currentTracks.filter(t => t !== track)
      : [...currentTracks, track];
    onUpdateTracks(updated, customDomains);
  };

  const addCustom = () => {
    if (!newCustom || DOMAIN_TRACKS.includes(newCustom) || customDomains.includes(newCustom)) return;
    const updatedCustom = [...customDomains, newCustom];
    onUpdateTracks([...currentTracks, newCustom], updatedCustom);
    setNewCustom('');
  };

  const removeCustom = (e: React.MouseEvent, track: string) => {
      e.stopPropagation();
      onUpdateTracks(currentTracks.filter(t => t !== track), customDomains.filter(t => t !== track));
  }

  return (
    <div className="bento-card p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Layers className="w-4 h-4 text-stone-400" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Domain Specialization</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {allAvailable.map((track) => (
          <button
            key={track}
            onClick={() => toggleTrack(track)}
            className={`p-3 text-left transition-all border rounded-xl flex items-center justify-between group ${
              currentTracks.includes(track) 
                ? 'bg-accent/10 border-accent/40 text-accent-light px-4 ring-1 ring-accent/20' 
                : 'bg-black/20 border-white/5 text-stone-300 hover:border-white/10 hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-widest transition-all ${
                    currentTracks.includes(track) ? 'text-white' : 'group-hover:text-white'
                }`}>{track}</span>
                {customDomains.includes(track) && (
                    <X className="w-3 h-3 text-stone-700 hover:text-red-500" onClick={(e) => removeCustom(e, track)} />
                )}
            </div>
            {currentTracks.includes(track) ? (
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(139,116,255,1)] border border-white/20"></div>
            ) : (
              <ChevronRight className="w-3 h-3 text-stone-700 group-hover:text-stone-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            )}
          </button>
        ))}
         <div className="flex mt-2 gap-2">
            <input 
              value={newCustom}
              onChange={(e) => setNewCustom(e.target.value)}
              placeholder="Add Custom Domain..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-2 text-[10px] text-white outline-none focus:border-accent ring-1 ring-white/5"
            />
            <button onClick={addCustom} className="p-2 bg-accent/10 text-accent rounded-xl border border-accent/20 hover:bg-accent hover:text-black transition-all">
                <Plus className="w-4 h-4" />
            </button>
         </div>
      </div>
    </div>
  );
}
