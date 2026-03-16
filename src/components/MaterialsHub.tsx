import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Link, Plus, CheckCircle2, Loader2, Trash2, X, ExternalLink, Eye } from 'lucide-react';
import { LearningMaterial } from '../types';
import { geminiService } from '../services/geminiService';

export default function MaterialsHub({ materials, onAdd }: { materials: LearningMaterial[], onAdd: (m: LearningMaterial) => void }) {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState('');
  const [viewingMaterial, setViewingMaterial] = useState<LearningMaterial | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMaterial: LearningMaterial = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: 'pdf', // Simplified for prototype
        processed: false,
        uploadDate: new Date()
      };
      onAdd(newMaterial);
    }
  };

  const handleAddUrl = () => {
    if (!url.trim()) return;
    const newMaterial: LearningMaterial = {
      id: Math.random().toString(36).substr(2, 9),
      name: url,
      type: 'link',
      processed: false,
      uploadDate: new Date()
    };
    onAdd(newMaterial);
    setUrl('');
    setShowUrlInput(false);
  };

  const processMaterial = async (id: string, name: string) => {
    setIsProcessing(id);
    try {
      await geminiService.processMaterial(name);
      // In a real app, we'd update the state. Here we just simulate.
      setTimeout(() => setIsProcessing(null), 2000);
    } catch (error) {
      console.error(error);
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Learning Hub</h3>
          <p className="text-2xl font-display font-bold">Materials</p>
        </div>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="h-12 w-12 rounded-2xl bg-velo-accent text-velo-black flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept=".pdf,.txt"
        />
      </section>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 border-dashed border-white/20 active:scale-95 transition-transform"
        >
          <FileText className="w-8 h-8 text-white/20" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Upload PDF</p>
        </button>
        <button 
          onClick={() => setShowUrlInput(true)}
          className="glass-card p-4 flex flex-col items-center justify-center gap-2 border-dashed border-white/20 active:scale-95 transition-transform"
        >
          <Link className="w-8 h-8 text-white/20" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Link URL</p>
        </button>
      </div>

      <AnimatePresence>
        {showUrlInput && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 space-y-4 overflow-hidden"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Enter URL</label>
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-velo-accent transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowUrlInput(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddUrl}
                className="flex-1 py-3 rounded-xl bg-velo-accent text-velo-black text-xs font-bold uppercase tracking-widest"
              >
                Add Link
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Your Documents</h3>
        <div className="space-y-3">
          {materials.length === 0 ? (
            <div className="glass-card py-16 text-center space-y-6 border-dashed border-white/10">
              <div className="h-24 w-24 rounded-[40px] bg-white/5 flex items-center justify-center mx-auto">
                <FileText className="w-12 h-12 text-white/10" />
              </div>
              <div className="space-y-2">
                <p className="font-bold text-xl">No materials yet</p>
                <p className="text-sm text-white/40 max-w-[240px] mx-auto">Upload your first lecture notes or paste a link to start learning.</p>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary h-16 w-full max-w-[260px] mx-auto"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="glass-card flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${m.processed ? 'bg-velo-accent/10' : 'bg-white/5'}`}>
                    {m.type === 'pdf' ? <FileText className={`w-5 h-5 ${m.processed ? 'text-velo-accent' : 'text-white/40'}`} /> : <Link className="w-5 h-5 text-white/40" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate max-w-[120px]">{m.name}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                      {m.processed ? 'AI Processed' : 'Pending AI Analysis'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setViewingMaterial(m)}
                    className="p-2 text-white/40 hover:text-velo-accent transition-colors active:scale-90"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {!m.processed && (
                    <button 
                      onClick={() => processMaterial(m.id, m.name)}
                      disabled={isProcessing === m.id}
                      className="h-8 px-3 rounded-lg bg-velo-accent/10 text-velo-accent text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {isProcessing === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Process'}
                    </button>
                  )}
                  {m.processed && <CheckCircle2 className="w-5 h-5 text-velo-accent" />}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Integrated Material Viewer */}
      <AnimatePresence>
        {viewingMaterial && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-velo-black flex flex-col"
          >
            <header className="p-6 flex justify-between items-center border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-velo-accent/10 flex items-center justify-center">
                  {viewingMaterial.type === 'pdf' ? <FileText className="w-5 h-5 text-velo-accent" /> : <Link className="w-5 h-5 text-velo-accent" />}
                </div>
                <div>
                  <h3 className="font-display font-bold truncate max-w-[200px]">{viewingMaterial.name}</h3>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                    {viewingMaterial.type === 'pdf' ? 'Document' : 'Web Resource'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingMaterial(null)}
                className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X className="w-6 h-6" />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-velo-accent uppercase tracking-[0.2em]">AI Summary</h4>
                <div className="glass-card p-6 bg-velo-accent/5 border-velo-accent/20">
                  <p className="text-sm leading-relaxed text-white/80">
                    {viewingMaterial.processed 
                      ? "This document covers the core principles of the subject, focusing on historical context and modern applications. Key takeaways include the importance of iterative testing and the role of environmental variables in outcome prediction."
                      : "AI is still analyzing this document. Once processed, a comprehensive summary and key insights will appear here."}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Full Content</h4>
                <div className="glass-card p-6 min-h-[400px] flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-sm text-white/40 max-w-[200px]">
                    In this prototype, full document rendering is simulated.
                  </p>
                  <button className="btn-secondary h-12 text-xs">
                    Open in External Browser
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
