/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FileText, Upload, Check, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface ResumeUploadProps {
  onUpload: (text: string | null) => void;
  currentResume: string | null;
}

export function ResumeUpload({ onUpload, currentResume }: ResumeUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const processText = (text: string) => {
    if (text.trim()) {
      onUpload(text);
      localStorage.setItem('IP_STORED_RESUME', text);
      setError('');
    } else {
      setError('The file seems to be empty or unreadable.');
    }
  };

  const handleFile = async (file: File) => {
    const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
    const isJson = file.type === 'application/json' || file.name.endsWith('.json');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');

    if (!isText && !isJson && !isPdf) {
      setError('Please upload a .txt, .md, .json, or .pdf file.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isPdf) {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .filter((item: any) => 'str' in item)
            .map((item: any) => item.str)
            .join(' ');
          fullText += pageText + '\n';
        }
        
        processText(fullText);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          processText(text);
        };
        reader.onerror = () => setError('Failed to read file.');
        reader.readAsText(file);
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setError('Failed to parse file: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearResume = () => {
    onUpload(null);
    localStorage.removeItem('IP_STORED_RESUME');
  };

  return (
    <div className="bento-card p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <label className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-3">
          <FileText className="w-4 h-4 text-stone-400" /> Resume Intel
        </label>
        {currentResume && (
          <button 
            onClick={clearResume}
            className="text-[9px] uppercase tracking-widest font-black text-red-500/60 hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3 h-3" /> PURGE
          </button>
        )}
      </div>

      {!currentResume ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer group ${
            isDragOver 
              ? 'border-accent bg-accent/5 ring-4 ring-accent/10' 
              : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/[0.04]'
          } ${loading ? 'opacity-50 cursor-wait' : ''}`}
          onClick={() => {
            if (loading) return;
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt,.md,.json,.pdf';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) handleFile(file);
            };
            input.click();
          }}
        >
          <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-stone-500 group-hover:scale-110 group-hover:text-accent transition-all border border-white/5 group-hover:border-accent/40 shadow-xl shadow-black/20">
            {loading ? <RefreshCw className="w-6 h-6 animate-spin text-accent" /> : <Upload className="w-6 h-6" />}
          </div>
          <div className="text-center">
            <p className="text-[11px] font-black text-white uppercase tracking-widest">
              {loading ? 'Synthesizing...' : 'Upload Profile'}
            </p>
            <p className="text-[9px] text-stone-500 mt-2 uppercase tracking-tight font-medium">
              Accepts .txt, .md, .json, .pdf
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent ring-1 ring-accent/20">
                <Check className="w-5 h-5" />
             </div>
             <div>
                <p className="text-xs font-black text-accent-light uppercase tracking-widest">Profile Synced</p>
                <p className="text-[10px] text-accent/50 font-mono tracking-tighter uppercase font-medium">status_stable_v4</p>
             </div>
          </div>
          <p className="text-[10px] font-mono text-accent/30 lowercase italic">
            {Math.round(currentResume.length / 1000)}kb_buffer
          </p>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red-400 flex items-center gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/20 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}
