/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { FileText, Upload, Check, Trash2, AlertCircle, RefreshCw } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-widest text-stone-600 flex items-center gap-2">
          <FileText className="w-3 h-3" /> Resume Intelligence
        </label>
        {currentResume && (
          <button 
            onClick={clearResume}
            className="text-[9px] uppercase tracking-wider text-red-500/60 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-2.5 h-2.5" /> Purge
          </button>
        )}
      </div>

      {!currentResume ? (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group ${
            isDragOver 
              ? 'border-accent bg-accent/5' 
              : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/[0.02]'
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
          <div className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-stone-500 group-hover:scale-110 group-hover:text-accent transition-all">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin text-accent" /> : <Upload className="w-5 h-5" />}
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              {loading ? 'Synthesizing...' : 'Upload Profile (.txt, .md, .json, .pdf)'}
            </p>
            <p className="text-[9px] text-stone-600 mt-1 uppercase tracking-tighter">
              Interviewer will use this context
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                <Check className="w-4 h-4" />
             </div>
             <div>
                <p className="text-[10px] font-black text-accent-light uppercase tracking-widest">Resume Synced</p>
                <p className="text-[9px] text-accent/60 font-mono tracking-tighter uppercase">Status: PERMANENT_STORAGE</p>
             </div>
          </div>
          <p className="text-[8px] font-mono text-accent/40 lowercase italic">
            Approx. {Math.round(currentResume.length / 1000)}k chars
          </p>
        </div>
      )}

      {error && (
        <div className="text-[10px] text-red-400 flex items-center gap-2 bg-red-500/5 p-2 rounded-lg border border-red-500/10">
          <AlertCircle className="w-3 h-3" /> {error}
        </div>
      )}
    </div>
  );
}
