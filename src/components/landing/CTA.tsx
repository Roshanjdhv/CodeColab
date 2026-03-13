import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA({ onStartCoding, isAuthenticated = false }: { onStartCoding: () => void, isAuthenticated?: boolean }) {
  return (
    <section className="w-full py-32 bg-slate-900 border-t border-slate-800 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-slate-800/40 backdrop-blur-xl border border-indigo-500/30 rounded-3xl md:rounded-[3rem] p-8 md:p-20 shadow-2xl shadow-indigo-500/10 relative overflow-hidden"
        >
          {/* Decorative mesh */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-500/20 rounded-2xl mb-8">
              <Sparkles className="w-8 h-8 text-indigo-400" />
            </div>
            
            <h2 className="text-3xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Start Collaborating <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Today</span>
            </h2>
            
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
              Join thousands of developers building the future of software together. No credit card required to start.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onStartCoding}
                className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                {isAuthenticated ? 'Open Dashboard' : 'Start Coding'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="hidden sm:flex w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700">
                Try Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
