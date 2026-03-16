import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun, Bell, Shield, Smartphone, ChevronRight, LogOut, Info, Camera, User as UserIcon, Loader2 } from 'lucide-react';
import { AppSettings, Theme, User } from '../types';
import { supabase } from '../supabaseClient';

interface SettingsViewProps {
  user: User | null;
  onUpdateUser: (user: User) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onLogout: () => void;
}

export default function SettingsView({ user, onUpdateUser, settings, onUpdateSettings, onLogout }: SettingsViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        try {
          // Update Supabase user metadata for permanent persistence
          const { data, error } = await supabase.auth.updateUser({
            data: { avatar_url: base64 }
          });

          if (error) throw error;

          // Update local state
          onUpdateUser({
            ...user,
            profilePicture: base64
          });
        } catch (error) {
          console.error('Error updating profile photo:', error);
          alert('Failed to save profile photo to database. Please try a smaller image.');
        } finally {
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleTheme = () => {
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    });
  };

  const toggleNudges = () => {
    onUpdateSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        studyNudges: !settings.notifications.studyNudges
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">System Settings</h3>
        <p className="text-2xl font-display font-bold">Preferences</p>
      </section>

      {/* Profile Customization */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Profile</h4>
        <div className="glass-card p-6 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-[32px] bg-velo-accent/10 border-2 border-velo-accent/20 flex items-center justify-center overflow-hidden relative">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-velo-accent/40" />
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-velo-black/60 flex items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-6 h-6 text-velo-accent animate-spin" />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-velo-accent text-velo-black flex items-center justify-center shadow-lg active:scale-90 transition-transform disabled:opacity-50 disabled:scale-100"
            >
              {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handlePhotoChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
          <div className="text-center">
            <p className="font-display font-bold text-xl">{user?.name}</p>
            <p className="text-xs text-white/40">{user?.email}</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary w-full h-14 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Change Photo'
            )}
          </button>
        </div>
      </section>

      {/* Appearance */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Appearance</h4>
        <div className="glass-card p-0 overflow-hidden">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-velo-accent/10 flex items-center justify-center">
                {settings.theme === 'dark' ? <Moon className="w-5 h-5 text-velo-accent" /> : <Sun className="w-5 h-5 text-velo-accent" />}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Dark Mode</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
                  {settings.theme === 'dark' ? 'Enabled for night study' : 'Disabled'}
                </p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.theme === 'dark' ? 'bg-velo-accent' : 'bg-white/10'}`}>
              <motion.div 
                animate={{ x: settings.theme === 'dark' ? 24 : 0 }}
                className="w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>
        </div>
      </section>

      {/* Notifications */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Notifications</h4>
        <div className="glass-card p-0 overflow-hidden divide-y divide-white/5">
          <button 
            onClick={toggleNudges}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">Study Nudges</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Smart reminders based on commute</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.notifications.studyNudges ? 'bg-velo-accent' : 'bg-white/10'}`}>
              <motion.div 
                animate={{ x: settings.notifications.studyNudges ? 24 : 0 }}
                className="w-4 h-4 rounded-full bg-white shadow-sm"
              />
            </div>
          </button>

          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-sm">Reminder Time</p>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">{settings.notifications.reminderTime}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20" />
          </div>
        </div>
      </section>

      {/* Offline Core */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Offline Core</h4>
        <div className="glass-card p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="font-bold text-sm">On-Device Processing</p>
              <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">Always enabled for zero latency</p>
            </div>
          </div>
          <div className="h-6 px-2 rounded bg-green-500/20 text-green-500 text-[8px] font-bold flex items-center">ACTIVE</div>
        </div>
      </section>

      {/* Account */}
      <section className="space-y-4">
        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account</h4>
        <div className="glass-card p-0 overflow-hidden divide-y divide-white/5">
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Info className="w-5 h-5 text-white/40" />
              </div>
              <p className="font-bold text-sm">Help & Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/20" />
          </div>
          <button 
            onClick={onLogout}
            className="w-full p-5 flex items-center gap-4 text-red-500 hover:bg-red-500/5 transition-colors"
          >
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <p className="font-bold text-sm">Sign Out</p>
          </button>
        </div>
      </section>

      <div className="text-center py-4">
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Velo Study v1.2.0</p>
      </div>
    </div>
  );
}
