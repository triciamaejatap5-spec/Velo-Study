import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Play, CheckCircle2, AlertCircle, Calendar, Zap, Headphones, BookOpen, Search, Check, X } from 'lucide-react';
import { StudyTask, CalendarEvent } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ProgressView from './ProgressView';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardProps {
  tasks: StudyTask[];
  materials: any[];
  calendarEvents: CalendarEvent[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleTask: (id: string) => void;
  onStartTask: (task: StudyTask) => void;
}

export default function Dashboard({ 
  tasks, 
  materials,
  calendarEvents, 
  searchQuery, 
  onSearchChange, 
  onToggleTask, 
  onStartTask 
}: DashboardProps) {
  const [isSynced, setIsSynced] = useState(() => {
    const user = JSON.parse(localStorage.getItem('velo_session') || 'null');
    const syncKey = user ? `velo_last_sync_${user.email}` : 'velo_last_sync';
    const lastSync = localStorage.getItem(syncKey);
    if (!lastSync) return false;
    const syncDate = new Date(lastSync).toDateString();
    return syncDate === new Date().toDateString();
  });
  const [showSearchFeedback, setShowSearchFeedback] = useState(false);

  const today = new Date().toDateString();
  const todayTasks = tasks.filter(t => new Date(t.deadline).toDateString() === today);
  const pendingTasks = todayTasks.filter(t => !t.completed);
  
  const upcomingDeadlines = calendarEvents
    .filter(e => e.type === 'deadline' && new Date(e.dateTime).getTime() > Date.now())
    .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const hasSyncableContent = upcomingDeadlines.length > 0 || materials.length > 0;

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchFeedback(true);
      setTimeout(() => setShowSearchFeedback(false), 2000);
    }
  };

  const handleConfirmPlan = () => {
    if (!hasSyncableContent) return;
    setIsSynced(true);
    const user = JSON.parse(localStorage.getItem('velo_session') || 'null');
    const syncKey = user ? `velo_last_sync_${user.email}` : 'velo_last_sync';
    localStorage.setItem(syncKey, new Date().toISOString());
  };

  const nextDeadline = upcomingDeadlines[0];
  const syncTitle = isSynced 
    ? "Plan Locked" 
    : nextDeadline 
      ? `${new Date(nextDeadline.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Deadline`
      : hasSyncableContent
        ? "Materials Ready"
        : "No Plan Generated";

  const syncDescription = isSynced
    ? "Your commute is optimized. Focus on your journey while we handle the schedule."
    : nextDeadline
      ? `Upcoming: ${nextDeadline.title}. I've optimized your commute for this deadline.`
      : materials.length > 0
        ? `You have ${materials.length} modules. I can optimize your commute for a quick review.`
        : "No deadlines yet—add one to start your plan.";

  const syncIcon = isSynced 
    ? <Check className="w-6 h-6" /> 
    : hasSyncableContent 
      ? <AlertCircle className="w-6 h-6" /> 
      : <Clock className="w-6 h-6 text-white/20" />;

  const syncCardBg = isSynced 
    ? "bg-velo-accent/10 border-velo-accent/30" 
    : hasSyncableContent 
      ? "bg-velo-accent/5 border-velo-accent/20" 
      : "bg-white/5 border-white/10 border-dashed";

  const syncIconBg = isSynced 
    ? "bg-velo-accent text-velo-black" 
    : hasSyncableContent 
      ? "bg-velo-accent/20 text-velo-accent" 
      : "bg-white/5 text-white/20";

  return (
    <div className="space-y-12 pb-20">
      {/* Universal Search Bar */}
      <section className="px-1">
        <form onSubmit={handleSearch} className="relative group">
          <button 
            type="submit"
            className="absolute inset-y-0 left-5 flex items-center"
          >
            <Search className="w-5 h-5 text-velo-accent" />
          </button>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search lessons, terms, notes..."
            className="w-full h-16 pl-14 pr-6 bg-white/5 border border-white/10 rounded-[24px] text-sm focus:outline-none focus:border-velo-accent focus:bg-white/10 transition-all placeholder:text-white/20 font-medium"
          />
          <div className="absolute inset-y-0 right-5 flex items-center">
            {searchQuery && (
              <button 
                type="button"
                onClick={() => onSearchChange('')}
                className="p-2 mr-2 text-white/20 hover:text-white/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold text-white/20 uppercase tracking-widest">Universal</div>
          </div>
          
          <AnimatePresence>
            {showSearchFeedback && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -bottom-8 left-0 right-0 text-center"
              >
                <span className="text-[10px] font-bold text-velo-accent uppercase tracking-widest">Searching "{searchQuery}"...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </section>

      {/* Daily Motivational Quote */}
      <section className="text-center px-4">
        <p className="text-lg font-display italic text-white/80 leading-tight">
          "The expert in anything was once a beginner."
        </p>
        <p className="text-[10px] font-bold text-velo-accent uppercase tracking-[0.2em] mt-2">— Helen Hayes</p>
      </section>

      {/* Today's Agenda */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-velo-accent" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Today's Agenda</h3>
        </div>
        <div className="glass-card bg-velo-muted/30 border-white/5">
          <div className="space-y-4">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-white/10" />
                </div>
                <p className="text-sm text-white/40 font-medium">Your agenda is clear for today.</p>
                <button className="btn-secondary h-12 text-xs w-full">
                  Add Study Session
                </button>
              </div>
            ) : (
              todayTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${task.completed ? 'bg-velo-accent' : 'bg-white/20'}`} />
                  <p className={`text-sm ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>{task.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-3">
            {upcomingDeadlines.slice(0, 2).map(deadline => (
              <div key={deadline.id} className="glass-card flex items-center justify-between p-4 border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">{deadline.title}</p>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
                      {deadline.subject} • {deadline.dateTime.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Phase 1: Morning Sync (The Planner) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-velo-accent" />
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Morning Sync</h3>
          </div>
          <span className="text-[10px] font-bold text-velo-accent bg-velo-accent/10 px-2 py-0.5 rounded-full">AI ACTIVE</span>
        </div>
        
        <div className={cn(
          "glass-card relative overflow-hidden transition-all duration-500",
          syncCardBg
        )}>
          <div className="flex gap-4">
            <div className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors",
              syncIconBg
            )}>
              {syncIcon}
            </div>
            <div>
              <p className={cn(
                "font-bold text-lg leading-tight",
                !hasSyncableContent && !isSynced && "text-white/20"
              )}>
                {syncTitle}
              </p>
              <p className={cn(
                "text-sm mt-1",
                isSynced || hasSyncableContent ? "text-white/60" : "text-white/20"
              )}>
                {syncDescription}
              </p>
            </div>
          </div>
          
          {!isSynced ? (
            hasSyncableContent && (
              <button 
                onClick={handleConfirmPlan}
                className="btn-primary w-full mt-6 h-14 text-sm shadow-lg shadow-velo-accent/20"
              >
                Confirm Morning Plan
              </button>
            )
          ) : (
            <div className="w-full mt-6 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 text-velo-accent font-bold uppercase text-xs tracking-widest">
              <Zap className="w-4 h-4 animate-pulse" />
              Optimization Active
            </div>
          )}
          
          {isSynced && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-velo-accent/50"
            />
          )}
        </div>
      </section>

      {/* Phase 2: Day Micro-Study (The Active Window) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-velo-accent" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Day Micro-Study</h3>
        </div>
        
        <div className="space-y-3">
          {pendingTasks.length === 0 ? (
            <div className="glass-card py-12 text-center space-y-4 border-dashed border-white/10">
              <div className="h-20 w-20 rounded-[32px] bg-velo-accent/5 flex items-center justify-center mx-auto">
                <Zap className="w-10 h-10 text-velo-accent/20" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-lg">
                  {hasSyncableContent ? "Ready to optimize?" : "Start your journey"}
                </p>
                <p className="text-sm text-white/40 max-w-[200px] mx-auto">
                  {hasSyncableContent 
                    ? "Perform your first Morning Sync to generate a commute plan."
                    : "No deadlines yet—add one to start your plan."}
                </p>
              </div>
              {hasSyncableContent && (
                <button 
                  onClick={handleConfirmPlan}
                  className="btn-primary h-16 w-full max-w-[240px] mx-auto"
                >
                  Sync Now
                </button>
              )}
            </div>
          ) : (
            pendingTasks.map((task, index) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card flex items-center justify-between group p-4"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleTask(task.id)}
                  className="h-6 w-6 rounded-full border-2 border-white/20 flex items-center justify-center hover:border-velo-accent transition-colors"
                >
                  <div className="h-3 w-3 rounded-full bg-transparent group-hover:bg-velo-accent/20" />
                </button>
                <div>
                  <p className="font-bold text-sm">{task.title}</p>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 mt-0.5">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {task.durationMinutes}m</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(task.deadline)} left</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onStartTask(task)}
                className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
              >
                {task.type === 'audio' ? <Headphones className="w-5 h-5 text-velo-accent" /> : <BookOpen className="w-5 h-5 text-velo-accent" />}
              </button>
            </motion.div>
          )))}
        </div>
      </section>

      {/* Phase 3: Evening Progress (The Dopamine Loop) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-velo-accent" />
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Evening Progress</h3>
        </div>
        <ProgressView tasks={tasks} />
      </section>
    </div>
  );
}
