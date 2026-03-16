import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Check, X, RotateCcw, Zap, Timer, Search, Book, Loader2, FileText, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { geminiService } from '../services/geminiService';
import { LearningMaterial } from '../types';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const MOCK_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: "What is the primary function of the mitochondria?",
    options: ["Protein synthesis", "Energy production (ATP)", "Waste disposal", "DNA storage"],
    correctAnswer: 1,
    explanation: "Mitochondria are known as the powerhouses of the cell, converting nutrients into ATP."
  },
  {
    id: '2',
    question: "Which organelle is responsible for photosynthesis?",
    options: ["Nucleus", "Ribosome", "Chloroplast", "Golgi apparatus"],
    correctAnswer: 2,
    explanation: "Chloroplasts capture light energy to drive the synthesis of organic compounds."
  }
];

interface QuizViewProps {
  materials: LearningMaterial[];
  onBack: () => void;
}

export default function QuizView({ materials, onBack }: QuizViewProps) {
  const [step, setStep] = useState<'lock' | 'selection' | 'quiz'>('lock');
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [showDictionary, setShowDictionary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [definition, setDefinition] = useState<{ definition: string, example: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (materials.length > 0) {
      setStep('selection');
    } else {
      setStep('lock');
    }
  }, [materials]);

  useEffect(() => {
    if (isFinished || step !== 'quiz') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLookup = async () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    try {
      const res = await geminiService.lookupTerm(searchTerm);
      setDefinition(res);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const currentQuestion = MOCK_QUESTIONS[currentIndex];

  const handleSelect = (index: number) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(index);
    const correct = index === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(s => s + 1);
      if (currentIndex === MOCK_QUESTIONS.length - 1) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF00', '#FFFFFF']
        });
      }
    }
  };

  const nextQuestion = () => {
    if (currentIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      setIsFinished(true);
      // Mark first quiz as completed for readiness calculation
      localStorage.setItem('velo_first_quiz_done', 'true');
    }
  };

  if (step === 'lock') {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 p-6">
        <div className="h-32 w-32 rounded-[40px] bg-white/5 flex items-center justify-center">
          <AlertCircle className="w-16 h-16 text-white/20" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-bold">Content Locked</h2>
          <p className="text-white/40 max-w-[280px] mx-auto">Please upload a study module to the Materials Hub to begin your first quiz.</p>
        </div>
        <button onClick={onBack} className="btn-primary h-16 w-full max-w-[280px]">
          Go to Materials Hub
        </button>
      </div>
    );
  }

  if (step === 'selection') {
    return (
      <div className="h-full flex flex-col space-y-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 text-white/40 hover:text-white transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-display font-bold">Select Source</h2>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          <p className="text-sm text-white/40 font-medium">Which material should I generate this 5-minute quiz from?</p>
          <div className="grid gap-3">
            {materials.map(m => (
              <button 
                key={m.id}
                onClick={() => setSelectedMaterial(m)}
                className={`glass-card flex items-center gap-4 p-5 text-left transition-all ${selectedMaterial?.id === m.id ? 'border-velo-accent bg-velo-accent/10' : 'border-white/5 hover:border-white/20'}`}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedMaterial?.id === m.id ? 'bg-velo-accent text-velo-black' : 'bg-white/5 text-white/40'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold truncate">{m.name}</p>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{m.type} • AI Processed</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pb-8">
          <button 
            onClick={() => setStep('quiz')}
            disabled={!selectedMaterial}
            className="btn-primary w-full h-16 disabled:opacity-50 disabled:grayscale"
          >
            Start 5-Min Quiz
          </button>
        </div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
        <div className="h-32 w-32 rounded-full bg-velo-accent/20 flex items-center justify-center">
          <Zap className="w-16 h-16 text-velo-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-display font-bold">Session Complete!</h2>
          <p className="text-white/60">You scored {score}/{MOCK_QUESTIONS.length} on {selectedMaterial?.name}.</p>
        </div>
        <div className="w-full space-y-4 pt-8">
          <button onClick={onBack} className="btn-primary w-full">Back to Dashboard</button>
          <button onClick={() => {
            setCurrentIndex(0);
            setSelectedOption(null);
            setIsCorrect(null);
            setScore(0);
            setIsFinished(false);
            setTimeLeft(300);
          }} className="btn-secondary w-full">
            <RotateCcw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 active:scale-95 transition-transform"
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="font-bold uppercase text-xs tracking-widest">Exit Quiz</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-velo-accent/10 border border-velo-accent/20">
            <Timer className="w-4 h-4 text-velo-accent" />
            <span className="text-sm font-display font-bold text-velo-accent">{formatTime(timeLeft)}</span>
          </div>
          <button 
            onClick={() => setShowDictionary(!showDictionary)}
            className={`p-2 rounded-xl border transition-colors ${showDictionary ? 'bg-velo-accent text-velo-black border-velo-accent' : 'bg-white/5 text-white/40 border-white/10'}`}
          >
            <Book className="w-5 h-5" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showDictionary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="glass-card bg-velo-muted border-velo-accent/30 p-4 space-y-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lookup term..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-velo-accent"
                />
                <button 
                  onClick={handleLookup}
                  disabled={isSearching}
                  className="h-10 w-10 rounded-xl bg-velo-accent text-velo-black flex items-center justify-center disabled:opacity-50"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {definition && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-velo-accent uppercase tracking-widest">Definition</p>
                  <p className="text-xs text-white/80">{definition.definition}</p>
                  <p className="text-[10px] italic text-white/40">Ex: {definition.example}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-8">
        <h2 className="text-2xl font-display font-bold leading-tight">
          {currentQuestion.question}
        </h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isCorrectOption = i === currentQuestion.correctAnswer;
            
            let borderColor = "border-white/10";
            let bgColor = "bg-velo-muted/50";
            let textColor = "text-white";

            if (selectedOption !== null) {
              if (isCorrectOption) {
                borderColor = "border-velo-accent";
                bgColor = "bg-velo-accent/10";
                textColor = "text-velo-accent";
              } else if (isSelected && !isCorrectOption) {
                borderColor = "border-red-500";
                bgColor = "bg-red-500/10";
                textColor = "text-red-500";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selectedOption !== null}
                className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center justify-between ${borderColor} ${bgColor} ${textColor}`}
              >
                <span className="font-bold">{option}</span>
                {selectedOption !== null && isCorrectOption && <Check className="w-6 h-6" />}
                {selectedOption !== null && isSelected && !isCorrectOption && <X className="w-6 h-6" />}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selectedOption !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-white/5 border-white/10"
            >
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Explanation</p>
              <p className="text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pb-8">
        <button 
          onClick={nextQuestion}
          disabled={selectedOption === null}
          className={`btn-primary w-full ${selectedOption === null ? 'opacity-50 grayscale' : ''}`}
        >
          {currentIndex === MOCK_QUESTIONS.length - 1 ? 'Finish Session' : 'Next Question'}
        </button>
      </div>
    </div>
  );
}
