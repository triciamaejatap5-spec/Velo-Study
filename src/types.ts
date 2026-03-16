export type View = 'dashboard' | 'study' | 'audio' | 'progress' | 'social' | 'materials' | 'chat' | 'settings' | 'calendar';

export type Theme = 'light' | 'dark';

export interface User {
  email: string;
  name: string;
  profilePicture?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  materialId: string;
  materialName: string;
  messages: ChatMessage[];
  lastUpdated: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  dateTime: Date;
  type: 'deadline' | 'session';
  subject: string;
  description?: string;
}

export interface NotificationSettings {
  studyNudges: boolean;
  reminderTime: string;
  days: string[];
}

export interface AppSettings {
  theme: Theme;
  notifications: NotificationSettings;
  offlineMode: boolean;
}

export interface LearningMaterial {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'link';
  url?: string;
  processed: boolean;
  uploadDate: Date;
}

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  deadline: Date;
  durationMinutes: number;
  type: 'reading' | 'quiz' | 'audio';
  completed: boolean;
}

export interface ExamReadiness {
  percentage: number;
  quizAverage: number;
  completionRate: number;
  streakBonus: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date;
  tasks: StudyTask[];
}
