import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Plus, X, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { CalendarEvent } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onAddEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export default function CalendarView({ events, onAddEvent, onDeleteEvent }: CalendarViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'session',
    dateTime: new Date(),
    subject: '',
    title: ''
  });

  const handleAdd = () => {
    if (newEvent.title && newEvent.subject) {
      onAddEvent({
        id: Math.random().toString(36).substr(2, 9),
        title: newEvent.title,
        subject: newEvent.subject,
        type: newEvent.type as 'deadline' | 'session',
        dateTime: new Date(newEvent.dateTime || Date.now()),
        description: newEvent.description
      });
      setIsAdding(false);
      setNewEvent({ type: 'session', dateTime: new Date(), subject: '', title: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold">Master Calendar</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="h-12 w-12 rounded-2xl bg-velo-accent text-velo-black flex items-center justify-center active:scale-90 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Event List */}
      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-12 text-center space-y-4">
            <CalendarIcon className="w-12 h-12 text-white/20" />
            <p className="text-white/40 font-medium">No events scheduled yet.<br/>Plan your study journey.</p>
          </div>
        ) : (
          events.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime()).map(event => (
            <motion.div 
              key={event.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card flex items-center gap-4 group"
            >
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0",
                event.type === 'deadline' ? "bg-red-500/10 text-red-500" : "bg-velo-accent/10 text-velo-accent"
              )}>
                {event.type === 'deadline' ? <AlertCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold truncate">{event.title}</p>
                <div className="flex items-center gap-2 text-[10px] text-white/40 font-medium uppercase tracking-wider">
                  <span>{event.subject}</span>
                  <span>•</span>
                  <span>{event.dateTime.toLocaleDateString()} @ {event.dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <button 
                onClick={() => onDeleteEvent(event.id)}
                className="p-2 rounded-xl bg-white/5 text-white/20 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsAdding(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm glass-card p-8 space-y-6"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-display font-bold">New Event</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 rounded-full bg-white/5">
                <X className="w-5 h-5 text-white/40" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Title</label>
                <input 
                  type="text" 
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 focus:border-velo-accent outline-none transition-colors"
                  placeholder="e.g., Final Exam Review"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={newEvent.subject}
                  onChange={e => setNewEvent({...newEvent, subject: e.target.value})}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 focus:border-velo-accent outline-none transition-colors"
                  placeholder="e.g., Physics 101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Type</label>
                  <select 
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 focus:border-velo-accent outline-none transition-colors appearance-none"
                  >
                    <option value="session">Study Session</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-white/40 tracking-wider">Date/Time</label>
                  <input 
                    type="datetime-local" 
                    onChange={e => setNewEvent({...newEvent, dateTime: new Date(e.target.value)})}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 focus:border-velo-accent outline-none transition-colors"
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full h-14 bg-velo-accent text-velo-black rounded-2xl font-display font-bold active:scale-95 transition-transform mt-4"
              >
                Add to Calendar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
