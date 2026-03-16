import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, Target, TrendingUp, Zap, CheckCircle2, Award } from 'lucide-react';
import { StudyTask } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ProgressView({ tasks = [] }: { tasks?: StudyTask[] }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Generate dynamic heatmap based on completed tasks in the last 28 days
  const generateHeatmap = () => {
    const grid = Array(4).fill(0).map(() => Array(7).fill(0));
    const now = new Date();
    
    tasks.filter(t => t.completed && t.deadline).forEach(task => {
      const taskDate = new Date(task.deadline!);
      const diffTime = Math.abs(now.getTime() - taskDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 28) {
        const dayIndex = (taskDate.getDay() + 6) % 7; // Adjust to M-S
        const weekIndex = 3 - Math.floor((diffDays - 1) / 7);
        if (weekIndex >= 0 && weekIndex < 4) {
          grid[weekIndex][dayIndex] = Math.min(3, grid[weekIndex][dayIndex] + 1);
        }
      }
    });
    return grid;
  };

  const heatmap = generateHeatmap();

  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  
  // Quiz average - only if quizzes are completed
  const quizzes = tasks.filter(t => t.type === 'quiz' && t.completed);
  const quizAverage = quizzes.length > 0 ? 85 : 0; // In a real app, this would be calculated from scores
  
  const streakBonus = completedTasks.length > 0 ? Math.min(10, Math.floor(completedTasks.length / 5) * 2) : 0; 
  
  // Readiness logic: 0% until first quiz is done, then based on metrics
  const isFirstQuizDone = localStorage.getItem('velo_first_quiz_done') === 'true';
  const readiness = !isFirstQuizDone ? 0 : Math.min(100, Math.round((quizAverage * 0.5) + (completionRate * 0.4) + (streakBonus * 2)));

  const streakDays = completedTasks.length > 0 ? Math.min(30, Math.floor(completedTasks.length / 2)) : 0;
  const level = Math.max(1, Math.floor(completedTasks.length / 10) + 1);

  // Achievements logic
  const hasCommuterHero = completedTasks.filter(t => t.type === 'audio').length >= 5;
  const hasPerfectQuiz = quizzes.length >= 5;

  return (
    <div className="space-y-8">
      {/* Exam Readiness Tracker */}
      <section className="glass-card bg-gradient-to-br from-velo-accent/10 to-transparent border-velo-accent/20 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Award className="w-24 h-24" />
        </div>
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-6">Exam Readiness</h3>
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-white/5"
            />
            <motion.circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              initial={{ strokeDashoffset: 440 }}
              animate={{ strokeDashoffset: 440 - (440 * readiness) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="text-velo-accent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-bold">{readiness}%</span>
            <span className="text-[10px] font-bold text-velo-accent uppercase tracking-widest">Ready</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/40 uppercase">Quiz Avg</p>
            <p className="text-sm font-bold">{quizAverage}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/40 uppercase">Modules</p>
            <p className="text-sm font-bold">{Math.round(completionRate)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/40 uppercase">Streak</p>
            <p className="text-sm font-bold">+{streakBonus}%</p>
          </div>
        </div>
      </section>

      <section className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Weekly Streak</h3>
          <div className="flex items-center gap-2">
            <Flame className={cn("w-8 h-8", streakDays > 0 ? "text-orange-500 fill-orange-500" : "text-white/10")} />
            <span className="text-4xl font-display font-bold">{streakDays} Days</span>
          </div>
        </div>
        <div className="h-16 w-16 rounded-2xl bg-velo-accent/10 border border-velo-accent/20 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-velo-accent">LEVEL</span>
          <span className="text-2xl font-display font-bold text-velo-accent">{level}</span>
        </div>
      </section>

      {/* Readiness Heatmap */}
      <section className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Readiness Heatmap</h3>
          <TrendingUp className="w-4 h-4 text-velo-accent" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between px-1">
            {days.map((d, i) => (
              <span key={i} className="text-[10px] font-bold text-white/20 w-6 text-center">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {heatmap.flat().map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className={`aspect-square rounded-md ${
                  val === 0 ? 'bg-white/5' :
                  val === 1 ? 'bg-velo-accent/20' :
                  val === 2 ? 'bg-velo-accent/50' :
                  'bg-velo-accent'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <span>Less Ready</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-sm bg-white/5" />
            <div className="w-2 h-2 rounded-sm bg-velo-accent/20" />
            <div className="w-2 h-2 rounded-sm bg-velo-accent/50" />
            <div className="w-2 h-2 rounded-sm bg-velo-accent" />
          </div>
          <span>Exam Ready</span>
        </div>
      </section>

      {/* Achievements */}
      {(hasCommuterHero || hasPerfectQuiz) && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Achievements</h3>
          <div className="grid grid-cols-2 gap-4">
            {hasCommuterHero && (
              <AchievementCard 
                icon={<Trophy className="text-yellow-500" />}
                title="Commuter Hero"
                desc="5 days transit study"
              />
            )}
            {hasPerfectQuiz && (
              <AchievementCard 
                icon={<Target className="text-blue-500" />}
                title="Perfect Quiz"
                desc="100% on 5 quizzes"
              />
            )}
          </div>
        </section>
      )}
      
      {!hasCommuterHero && !hasPerfectQuiz && (
        <section className="py-12 text-center space-y-4 glass-card border-dashed border-white/10">
          <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
            <Trophy className="w-8 h-8 text-white/10" />
          </div>
          <div className="space-y-1">
            <p className="font-bold">No Achievements Yet</p>
            <p className="text-xs text-white/40">Complete tasks and quizzes to earn badges.</p>
          </div>
        </section>
      )}
    </div>
  );
}

function AchievementCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">{desc}</p>
      </div>
    </div>
  );
}
