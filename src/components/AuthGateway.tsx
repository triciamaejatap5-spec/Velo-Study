import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Mail, Lock, User, ArrowRight, ChevronLeft } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../supabaseClient';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AuthGatewayProps {
  onAuthSuccess: (user: { email: string }) => void;
}

type AuthMode = 'signin' | 'signup';

export default function AuthGateway({ onAuthSuccess }: AuthGatewayProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      if (mode === 'signup') {
        if (!name || !email || !password) {
          throw new Error('Please fill in all fields');
        }
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) throw signUpError;
        
        // UX Improvement: Redirect to sign in with success message and pre-filled email
        setSuccessMessage('Your account has been created. Please check your email and verify your address before logging in.');
        setMode('signin');
        setPassword('');
        setName('');
        
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data.user && data.session) {
          const userData = { 
            email: data.user.email!, 
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            profilePicture: data.user.user_metadata?.avatar_url
          };
          localStorage.setItem('velo_session', JSON.stringify(userData));
          onAuthSuccess(userData);
        } else if (data.user && !data.session) {
          setError('Please confirm your email address before signing in.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen bg-velo-black text-white flex flex-col px-6 pt-20 pb-10">
      <div className="flex-1 flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-12"
        >
          <div className="h-12 w-12 rounded-2xl bg-velo-accent flex items-center justify-center shadow-lg shadow-velo-accent/20">
            <Zap className="w-7 h-7 text-velo-black" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-extrabold tracking-tight uppercase">Velo Study</h1>
            <p className="text-[10px] font-bold text-velo-accent uppercase tracking-[0.2em]">Commuter Edition</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col"
          >
            <div className="mb-10">
              <h2 className="text-4xl font-display font-bold leading-tight">
                {mode === 'signin' ? 'Welcome\nBack' : 'Create\nAccount'}
              </h2>
              <p className="text-white/40 mt-4 font-medium">
                {mode === 'signin' 
                  ? 'Sign in to continue your commute learning journey.' 
                  : 'Join thousands of commuters optimizing their study time.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                  <input 
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-16 bg-velo-muted border border-white/10 rounded-2xl pl-14 pr-6 focus:outline-none focus:border-velo-accent transition-colors"
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-16 bg-velo-muted border border-white/10 rounded-2xl pl-14 pr-6 focus:outline-none focus:border-velo-accent transition-colors"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                <input 
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-16 bg-velo-muted border border-white/10 rounded-2xl pl-14 pr-6 focus:outline-none focus:border-velo-accent transition-colors"
                />
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-xs font-bold uppercase tracking-widest text-center"
                >
                  {error}
                </motion.p>
              )}

              {successMessage && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-velo-accent text-xs font-bold uppercase tracking-widest text-center bg-velo-accent/10 p-4 rounded-xl"
                >
                  {successMessage}
                </motion.p>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full h-16 mt-4 relative overflow-hidden group"
              >
                {isLoading ? (
                  <div className="h-6 w-6 border-2 border-velo-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Sign Up'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-auto pt-10 text-center">
              <button 
                onClick={toggleMode}
                className="text-white/40 hover:text-velo-accent transition-colors font-bold uppercase text-[10px] tracking-[0.2em]"
              >
                {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
