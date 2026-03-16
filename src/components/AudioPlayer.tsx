import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Bookmark, 
  ChevronLeft,
  Volume2,
  Mic
} from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { StudyTask } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AudioPlayerProps {
  playlist: StudyTask[];
  onBack: () => void;
}

export default function AudioPlayer({ playlist, onBack }: AudioPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [showVolume, setShowVolume] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentIndex] || {
    title: "No Audio Selected",
    subject: "N/A"
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const summary = `This is a summary for ${currentTrack.title} in ${currentTrack.subject}. Quantum mechanics is a fundamental theory in physics that provides a description of the physical properties of nature at the scale of atoms and subatomic particles.`;
      const base64 = await geminiService.generateAudioLesson(summary);
      if (base64) {
        const url = `data:audio/mp3;base64,${base64}`;
        setAudioUrl(url);
      }
    } catch (error) {
      console.error("Failed to generate audio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  return (
    <div className="h-full flex flex-col">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-white/60 mb-8 active:scale-95 transition-transform"
      >
        <ChevronLeft className="w-6 h-6" />
        <span className="font-bold uppercase text-xs tracking-widest">Back to Plan</span>
      </button>

      <div className="flex-1 flex flex-col items-center justify-center space-y-12">
        {/* Visualizer Placeholder */}
        <div className="w-full h-48 flex items-center justify-center gap-1">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                height: isPlaying ? [20, 80, 40, 100, 20] : 20 
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 1 + Math.random(),
                ease: "easeInOut"
              }}
              className="w-1.5 bg-velo-accent rounded-full opacity-60"
            />
          ))}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-display font-bold">{currentTrack.title}</h2>
          <p className="text-velo-accent font-bold tracking-widest uppercase text-sm">{currentTrack.subject} • Lesson {currentIndex + 1}</p>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-2">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-velo-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <span>04:20</span>
            <span>-08:45</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-4 relative">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center transition-all active:scale-90",
              isBookmarked ? "bg-velo-accent text-velo-black" : "bg-white/5 text-white/60"
            )}
          >
            <Bookmark className={cn("w-6 h-6", isBookmarked && "fill-current")} />
          </button>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={handlePrev}
              className="h-16 w-16 flex items-center justify-center text-white/60 active:scale-90 transition-transform"
            >
              <SkipBack className="w-10 h-10" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="h-24 w-24 rounded-full bg-velo-white text-velo-black flex items-center justify-center shadow-2xl shadow-white/20 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-2" />}
            </button>
            <button 
              onClick={handleNext}
              className="h-16 w-16 flex items-center justify-center text-white/60 active:scale-90 transition-transform"
            >
              <SkipForward className="w-10 h-10" />
            </button>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowVolume(!showVolume)}
              className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center transition-all active:scale-90",
                showVolume ? "bg-white/20 text-white" : "bg-white/5 text-white/60"
              )}
            >
              <Volume2 className="w-6 h-6" />
            </button>
            
            <AnimatePresence>
              {showVolume && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-16 right-0 bg-velo-muted border border-white/10 p-6 rounded-[32px] shadow-2xl z-50 w-16 flex flex-col items-center gap-6"
                >
                  <div className="h-40 w-3 bg-white/10 rounded-full relative">
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="absolute inset-0 w-40 h-10 -rotate-90 origin-center cursor-pointer opacity-0 z-10"
                      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)' }}
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-velo-accent rounded-full"
                      style={{ height: `${volume}%` }}
                    />
                    <motion.div 
                      className="absolute left-1/2 -translate-x-1/2 w-5 h-5 bg-white rounded-full shadow-lg border-2 border-velo-accent"
                      style={{ bottom: `calc(${volume}% - 10px)` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-velo-accent">{volume}%</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Voice Memo Button - Thumb Zone */}
      <div className="mt-auto pb-8">
        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-secondary w-full group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-velo-accent/10 translate-y-full group-hover:translate-y-0 transition-transform" />
          <Mic className="w-6 h-6 text-velo-accent" />
          <span>{isGenerating ? 'Generating Audio...' : 'Record Voice Note'}</span>
        </button>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />}
    </div>
  );
}
