import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Headphones, 
  BarChart3, 
  Users,
  Zap,
  Cloud,
  ChevronUp,
  ChevronDown,
  X,
  MessageCircle,
  FolderOpen,
  Settings,
  Calendar as CalendarIcon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './supabaseClient';
import { View, StudyTask, LearningMaterial, AppSettings, CalendarEvent, User, ChatSession } from './types';

// Components
import Dashboard from './components/Dashboard';
import AudioPlayer from './components/AudioPlayer';
import QuizView from './components/QuizView';
import ProgressView from './components/ProgressView';
import SocialHub from './components/SocialHub';
import MaterialsHub from './components/MaterialsHub';
import ChatTutor from './components/ChatTutor';
import SettingsView from './components/SettingsView';
import CalendarView from './components/CalendarView';
import AuthGateway from './components/AuthGateway';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = {
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          profilePicture: session.user.user_metadata?.avatar_url
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsInitializing(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          profilePicture: session.user.user_metadata?.avatar_url
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUserKey = (key: string) => user ? `${key}_${user.email}` : key;

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(getUserKey('velo_settings'));
    return saved ? JSON.parse(saved) : {
      theme: 'dark',
      notifications: {
        studyNudges: true,
        reminderTime: '08:30 AM',
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      offlineMode: true
    };
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    const saved = localStorage.getItem(getUserKey('velo_tasks'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((t: any) => ({
          ...t,
          deadline: t.deadline ? new Date(t.deadline) : undefined
        }));
      } catch (e) {
        console.error('Failed to parse tasks', e);
      }
    }
    return [];
  });

  const [materials, setMaterials] = useState<LearningMaterial[]>(() => {
    const saved = localStorage.getItem(getUserKey('velo_materials'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          uploadDate: m.uploadDate ? new Date(m.uploadDate) : new Date()
        }));
      } catch (e) {
        console.error('Failed to parse materials', e);
      }
    }
    return [];
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem(getUserKey('velo_calendar'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((e: any) => ({
          ...e,
          dateTime: new Date(e.dateTime)
        }));
      } catch (e) {
        console.error('Failed to parse calendar events', e);
      }
    }
    return [];
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem(getUserKey('velo_chat_sessions'));
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      } catch (e) {
        console.error('Failed to parse chat sessions', e);
      }
    }
    return [];
  });

  // Re-load data when user changes
  useEffect(() => {
    if (user) {
      const savedTasks = localStorage.getItem(getUserKey('velo_tasks'));
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks).map((t: any) => ({ ...t, deadline: t.deadline ? new Date(t.deadline) : undefined })));
      } else {
        setTasks([]);
      }

      const savedMaterials = localStorage.getItem(getUserKey('velo_materials'));
      if (savedMaterials) {
        setMaterials(JSON.parse(savedMaterials).map((m: any) => ({ ...m, uploadDate: m.uploadDate ? new Date(m.uploadDate) : new Date() })));
      } else {
        setMaterials([]);
      }

      const savedCalendar = localStorage.getItem(getUserKey('velo_calendar'));
      if (savedCalendar) {
        setCalendarEvents(JSON.parse(savedCalendar).map((e: any) => ({ ...e, dateTime: new Date(e.dateTime) })));
      } else {
        setCalendarEvents([]);
      }

      const savedChat = localStorage.getItem(getUserKey('velo_chat_sessions'));
      if (savedChat) {
        setChatSessions(JSON.parse(savedChat).map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        })));
      } else {
        setChatSessions([]);
      }

      const savedSettings = localStorage.getItem(getUserKey('velo_settings'));
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('velo_session', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem(getUserKey('velo_chat_sessions'), JSON.stringify(chatSessions));
  }, [chatSessions]);

  useEffect(() => {
    if (user) localStorage.setItem(getUserKey('velo_calendar'), JSON.stringify(calendarEvents));
    
    // Sync calendar events to tasks if they are sessions for today
    const today = new Date().toDateString();
    const todaySessions = calendarEvents.filter(e => 
      e.type === 'session' && new Date(e.dateTime).toDateString() === today
    );
    
    // Simple sync: if a session is not in tasks, add it
    todaySessions.forEach(session => {
      if (!tasks.find(t => t.id === session.id)) {
        setTasks(prev => [...prev, {
          id: session.id,
          title: session.title,
          subject: session.subject,
          deadline: session.dateTime,
          durationMinutes: 30,
          type: 'reading',
          completed: false
        }]);
      }
    });

    // Also sync deadlines to tasks if they are for today
    const todayDeadlines = calendarEvents.filter(e => 
      e.type === 'deadline' && new Date(e.dateTime).toDateString() === today
    );
    todayDeadlines.forEach(deadline => {
      if (!tasks.find(t => t.id === deadline.id)) {
        setTasks(prev => [...prev, {
          id: deadline.id,
          title: `DEADLINE: ${deadline.title}`,
          subject: deadline.subject,
          deadline: deadline.dateTime,
          durationMinutes: 0,
          type: 'reading',
          completed: false
        }]);
      }
    });
  }, [calendarEvents, user]);

  useEffect(() => {
    if (user) localStorage.setItem(getUserKey('velo_tasks'), JSON.stringify(tasks));
  }, [tasks, user]);

  useEffect(() => {
    if (user) localStorage.setItem(getUserKey('velo_materials'), JSON.stringify(materials));
  }, [materials, user]);

  useEffect(() => {
    if (user) localStorage.setItem(getUserKey('velo_settings'), JSON.stringify(settings));
    // Apply theme to body
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [settings, user]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const renderView = () => {
    const audioTasks = tasks.filter(t => t.type === 'audio');

    switch (currentView) {
      case 'dashboard': return (
        <Dashboard 
          tasks={tasks} 
          materials={materials}
          calendarEvents={calendarEvents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleTask={toggleTask} 
          onStartTask={(t) => {
            if (t.type === 'audio') setCurrentView('audio');
            else setCurrentView('study');
            setIsSheetOpen(false);
          }} 
        />
      );
      case 'audio': return (
        <AudioPlayer 
          playlist={audioTasks}
          onBack={() => setCurrentView('dashboard')} 
        />
      );
      case 'study': return <QuizView materials={materials} onBack={() => setCurrentView('dashboard')} />;
      case 'progress': return <ProgressView tasks={tasks} />;
      case 'social': return <SocialHub />;
      case 'materials': return <MaterialsHub materials={materials} onAdd={(m) => setMaterials([...materials, m])} />;
      case 'settings': return <SettingsView 
        user={user}
        onUpdateUser={setUser}
        settings={settings} 
        onUpdateSettings={setSettings} 
        onLogout={async () => {
          await supabase.auth.signOut();
          localStorage.removeItem('velo_session');
          setIsAuthenticated(false);
          setUser(null);
          setCurrentView('dashboard');
        }}
      />;
      case 'calendar': return <CalendarView 
        events={calendarEvents} 
        onAddEvent={(e) => setCalendarEvents([...calendarEvents, e])}
        onDeleteEvent={(id) => setCalendarEvents(calendarEvents.filter(e => e.id !== id))}
      />;
      default: return (
        <Dashboard 
          tasks={tasks} 
          materials={materials}
          calendarEvents={calendarEvents}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggleTask={toggleTask} 
          onStartTask={() => {}} 
        />
      );
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-velo-black flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-velo-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthGateway 
        onAuthSuccess={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className={cn(
      "relative h-screen w-full max-w-md mx-auto overflow-hidden flex flex-col font-sans transition-colors duration-500",
      settings.theme === 'dark' ? "bg-velo-black text-white" : "bg-white text-velo-black"
    )}>
      {/* Upper Region: Cloud Sync & Summaries */}
      <header className={cn(
        "pt-12 px-6 pb-4 flex justify-between items-start z-20 backdrop-blur-md",
        settings.theme === 'dark' ? "bg-velo-black/80" : "bg-white/80"
      )}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-velo-accent/10 border border-velo-accent/20 flex items-center justify-center overflow-hidden">
            <img 
              src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-[10px] font-bold text-velo-accent uppercase tracking-[0.2em]">Velo Study</h2>
              <div className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded border",
                settings.theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10"
              )}>
                <Cloud className={cn("w-2.5 h-2.5", settings.theme === 'dark' ? "text-white/40" : "text-black/40")} />
                <span className={cn("text-[8px] font-bold uppercase", settings.theme === 'dark' ? "text-white/40" : "text-black/40")}>Synced</span>
              </div>
            </div>
            <p className="text-lg font-display font-bold leading-none">{user?.name || 'Commuter'}</p>
            <p className={cn("text-[10px] font-medium", settings.theme === 'dark' ? "text-white/40" : "text-black/40")}>
              {tasks.length > 0 ? `Next: ${tasks[0].title}` : 'No upcoming tasks'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('settings')}
          className={cn(
            "h-10 w-10 rounded-2xl border flex items-center justify-center active:scale-90 transition-transform",
            settings.theme === 'dark' ? "bg-velo-muted border-white/10" : "bg-gray-100 border-black/10"
          )}
        >
          <Zap className="w-5 h-5 text-velo-accent" />
        </button>
      </header>

      {/* Main Content: Vertical Scroll View */}
      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-40 scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AI Tutor Chat Overlay */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-32 top-24 z-[60] bg-velo-muted rounded-[32px] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            <ChatTutor 
              onClose={() => setIsChatOpen(false)} 
              tasks={tasks}
              materials={materials}
              sessions={chatSessions}
              onUpdateSessions={setChatSessions}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent AI Tutor Toggle */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={cn(
          "fixed right-6 bottom-32 z-50 h-14 w-14 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90",
          isChatOpen ? "bg-white text-velo-black" : "bg-velo-accent text-velo-black shadow-velo-accent/20"
        )}
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Progressive Disclosure: Collapsible Bottom Sheet */}
      <AnimatePresence>
        {isSheetOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-velo-muted rounded-t-[40px] border-t border-white/10 p-8 pt-4 shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-display font-bold">Quick Actions</h3>
                  <button onClick={() => setIsSheetOpen(false)} className="p-2 rounded-full bg-white/5">
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ActionButton 
                    icon={<Headphones className="w-6 h-6" />}
                    label="Audio Mode"
                    desc="Listen to lessons"
                    onClick={() => { setCurrentView('audio'); setIsSheetOpen(false); }}
                    color="bg-blue-500/10 text-blue-500"
                  />
                  <ActionButton 
                    icon={<BookOpen className="w-6 h-6" />}
                    label="Take Quiz"
                    desc="5-min micro-test"
                    onClick={() => { setCurrentView('study'); setIsSheetOpen(false); }}
                    color="bg-velo-accent/10 text-velo-accent"
                  />
                  <ActionButton 
                    icon={<FolderOpen className="w-6 h-6" />}
                    label="Materials"
                    desc="Upload documents"
                    onClick={() => { setCurrentView('materials'); setIsSheetOpen(false); }}
                    color="bg-purple-500/10 text-purple-500"
                  />
                  <ActionButton 
                    icon={<BarChart3 className="w-6 h-6" />}
                    label="Readiness"
                    desc="Exam tracker"
                    onClick={() => { setCurrentView('progress'); setIsSheetOpen(false); }}
                    color="bg-orange-500/10 text-orange-500"
                  />
                  <ActionButton 
                    icon={<Settings className="w-6 h-6" />}
                    label="Settings"
                    desc="App preferences"
                    onClick={() => { setCurrentView('settings'); setIsSheetOpen(false); }}
                    color="bg-gray-500/10 text-gray-400"
                  />
                  <ActionButton 
                    icon={<CalendarIcon className="w-6 h-6" />}
                    label="Calendar"
                    desc="Plan your study"
                    onClick={() => { setCurrentView('calendar'); setIsSheetOpen(false); }}
                    color="bg-emerald-500/10 text-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Natural Reach Zone: Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-30 px-6 pb-10 pt-6 bg-gradient-to-t from-velo-black via-velo-black/90 to-transparent">
        <div className="glass-card flex justify-between items-center gap-2 px-4 py-3">
          <NavButton 
            active={currentView === 'dashboard'} 
            onClick={() => { setCurrentView('dashboard'); setIsSheetOpen(false); }}
            icon={<LayoutDashboard className="w-6 h-6" />}
            label="Home"
          />
          <NavButton 
            active={currentView === 'progress'} 
            onClick={() => { setCurrentView('progress'); setIsSheetOpen(false); }}
            icon={<BarChart3 className="w-6 h-6" />}
            label="Stats"
          />
          
          {/* Main Action Trigger */}
          <button 
            onClick={() => setIsSheetOpen(!isSheetOpen)}
            className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90 relative -top-6",
              isSheetOpen ? "bg-white text-velo-black rotate-180" : "bg-velo-accent text-velo-black shadow-velo-accent/20"
            )}
          >
            {isSheetOpen ? <ChevronDown className="w-8 h-8" /> : <ChevronUp className="w-8 h-8" />}
          </button>

          <NavButton 
            active={currentView === 'social'} 
            onClick={() => { setCurrentView('social'); setIsSheetOpen(false); }}
            icon={<Users className="w-6 h-6" />}
            label="Social"
          />
          <NavButton 
            active={currentView === 'calendar'} 
            onClick={() => { setCurrentView('calendar'); setIsSheetOpen(false); }}
            icon={<CalendarIcon className="w-6 h-6" />}
            label="Calendar"
          />
          <NavButton 
            active={currentView === 'settings'} 
            onClick={() => { setCurrentView('settings'); setIsSheetOpen(false); }}
            icon={<Settings className="w-6 h-6" />}
            label="Settings"
          />
          <NavButton 
            active={currentView === 'materials'} 
            onClick={() => { setCurrentView('materials'); setIsSheetOpen(false); }}
            icon={<FolderOpen className="w-6 h-6" />}
            label="Files"
          />
        </div>
      </nav>
    </div>
  );
}

function ActionButton({ icon, label, desc, onClick, color }: { icon: any, label: string, desc: string, onClick: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-start p-5 rounded-[32px] bg-white/5 border border-white/10 text-left active:scale-95 transition-transform group"
    >
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-4 group-active:scale-90 transition-transform", color)}>
        {icon}
      </div>
      <p className="font-display font-bold text-sm leading-tight">{label}</p>
      <p className="text-[10px] text-white/40 font-medium mt-1">{desc}</p>
    </button>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-colors min-w-[48px] min-h-[48px] justify-center",
        active ? "text-velo-accent" : "text-white/40"
      )}
    >
      {icon}
      <span className="text-[8px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}
