import React from 'react';
import { motion } from 'motion/react';
import { Share2, ThumbsUp, MessageSquare, Globe, Award } from 'lucide-react';

export default function SocialHub() {
  const [contributions, setContributions] = React.useState<any[]>([]);

  return (
    <div className="space-y-8">
      <section className="flex justify-between items-center">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Synthesis Market</h3>
          <p className="text-2xl font-display font-bold">Global Hub</p>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-velo-accent text-velo-black flex items-center justify-center">
          <Globe className="w-6 h-6" />
        </div>
      </section>

      {/* Neural Credits */}
      <section className="glass-card bg-gradient-to-br from-velo-accent/20 to-transparent border-velo-accent/30">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold text-velo-accent uppercase tracking-widest mb-1">Your Neural Credits</p>
            <p className="text-4xl font-display font-bold">0</p>
          </div>
          <Award className="w-8 h-8 text-velo-accent opacity-20" />
        </div>
        <p className="text-xs text-white/60 mt-4">Earn credits by sharing high-quality AI summaries with the community. Start by uploading your first document.</p>
      </section>

      {/* Feed */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-widest">Top Summaries</h3>
        <div className="space-y-4">
          {contributions.length === 0 ? (
            <div className="glass-card py-12 text-center space-y-4 border-dashed border-white/10">
              <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <Share2 className="w-8 h-8 text-white/10" />
              </div>
              <div className="space-y-1">
                <p className="font-bold">Market is quiet</p>
                <p className="text-xs text-white/40">Be the first to share a synthesis and earn credits.</p>
              </div>
              <button className="btn-secondary h-12 text-xs w-full">
                Share Synthesis
              </button>
            </div>
          ) : (
            contributions.map((item, index) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={item.avatar} alt={item.user} className="h-8 w-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                    <span className="font-bold text-sm">{item.user}</span>
                  </div>
                  <span className="text-[10px] font-bold text-velo-accent bg-velo-accent/10 px-2 py-1 rounded-md uppercase tracking-widest">
                    {item.subject}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  "{item.summary}"
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <button className="flex items-center gap-2 text-white/40 hover:text-velo-accent transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-xs font-bold">{item.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-white/40 hover:text-velo-accent transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-xs font-bold">{item.comments}</span>
                  </button>
                  <button className="ml-auto text-white/40 hover:text-velo-accent transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
