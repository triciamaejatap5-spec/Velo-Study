import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Sparkles, X, History, Plus, MessageSquare, Clock as ClockIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { StudyTask, LearningMaterial, ChatSession, ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';
import { formatDistanceToNow } from 'date-fns';

interface ChatTutorProps {
  onClose: () => void;
  tasks?: StudyTask[];
  materials?: LearningMaterial[];
  sessions: ChatSession[];
  onUpdateSessions: (sessions: ChatSession[]) => void;
}

export default function ChatTutor({ 
  onClose, 
  tasks = [], 
  materials = [],
  sessions,
  onUpdateSessions
}: ChatTutorProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(sessions.length > 0);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSession?.messages, isTyping]);

  const handleStartSession = (m: LearningMaterial) => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      materialId: m.id,
      materialName: m.name,
      messages: [
        { id: '1', role: 'model', text: `Hi! I'm ready to help you with "${m.name}". What would you like to know?`, timestamp: new Date() }
      ],
      lastUpdated: new Date()
    };
    onUpdateSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setShowHistory(false);
  };

  const handleSend = async () => {
    if (!input.trim() || !activeSessionId) return;
    
    const userMsgText = input;
    setInput('');
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: new Date()
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMsg],
          lastUpdated: new Date()
        };
      }
      return s;
    });
    onUpdateSessions(updatedSessions);
    setIsTyping(true);

    const context = `
      Learning Material: ${activeSession?.materialName}
      Current Tasks: ${tasks.map(t => `${t.title} (${t.completed ? 'Completed' : 'Pending'})`).join(', ')}
    `;

    try {
      const responseText = await geminiService.chatWithTutor(userMsgText, context);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm sorry, I couldn't process that.",
        timestamp: new Date()
      };

      onUpdateSessions(sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, botMsg],
            lastUpdated: new Date()
          };
        }
        return s;
      }));
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Error connecting to AI. Please try again.",
        timestamp: new Date()
      };
      onUpdateSessions(sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, errorMsg],
            lastUpdated: new Date()
          };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  if (showHistory || !activeSessionId) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-velo-muted">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-velo-accent/20 flex items-center justify-center">
              <History className="w-6 h-6 text-velo-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold">Chat History</h3>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{sessions.length} Sessions</p>
            </div>
          </div>
          <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <section className="space-y-3">
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">New Session</h4>
            <div className="grid gap-3">
              {materials.length === 0 ? (
                <p className="text-xs text-white/20 italic">Upload materials to start a chat</p>
              ) : (
                materials.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => handleStartSession(m)}
                    className="glass-card p-4 flex items-center justify-between hover:border-velo-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-velo-accent" />
                      <span className="text-sm font-bold">{m.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  </button>
                ))
              )}
            </div>
          </section>

          {sessions.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Previous Chats</h4>
              <div className="space-y-3">
                {sessions.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => {
                      setActiveSessionId(s.id);
                      setShowHistory(false);
                    }}
                    className="w-full glass-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-white/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{s.materialName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                        <ClockIcon className="w-3 h-3" />
                        <span>{formatDistanceToNow(s.lastUpdated)} ago</span>
                        <span>•</span>
                        <span>{s.messages.length} messages</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-velo-muted">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHistory(true)}
            className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-white/60" />
          </button>
          <div className="h-10 w-10 rounded-xl bg-velo-accent/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-velo-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display font-bold truncate">{activeSession?.materialName}</h3>
            <p className="text-[10px] text-velo-accent font-bold uppercase tracking-widest">AI Tutor Active</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white/60" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-velo-black/50">
        {activeSession?.messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-5 rounded-2xl text-sm shadow-lg ${
              msg.role === 'user' 
                ? 'bg-velo-accent text-velo-black font-medium' 
                : 'bg-velo-muted border border-white/10 text-white'
            }`}>
              {msg.text}
              <div className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-velo-black/40' : 'text-white/20'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-velo-muted border border-white/10 p-5 rounded-2xl flex gap-1">
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-velo-muted border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this material..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-velo-accent transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="h-14 w-14 rounded-2xl bg-velo-accent text-velo-black flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
