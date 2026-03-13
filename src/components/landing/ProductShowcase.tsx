import React from 'react';
import { motion } from 'framer-motion';

export function ProductShowcase() {
  return (
    <section id="showcase" className="w-full py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            A powerful editor, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">built for teams</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Experience lightning-fast collaboration with our state-of-the-art interactive coding workspace.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full max-w-5xl mx-auto"
        >
          {/* Editor shadow/glow */}
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-blue-500/20 blur-3xl transform -translate-y-4 rounded-[40px] z-0" />
          
          <div className="relative rounded-[2rem] border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/5 z-10 flex flex-col md:flex-row h-[600px]">
            {/* Sidebar */}
            <div className="hidden md:flex w-64 border-r border-slate-800 flex-col bg-slate-900/90 backdrop-blur">
              <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                  <span className="text-teal-400 font-bold">W</span>
                </div>
                <span className="text-slate-200 font-semibold">Web Project</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Files</div>
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-md">
                  <span className="text-yellow-500">{"{}"}</span> package.json
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 px-3 py-1.5 hover:text-slate-300 cursor-pointer">
                  <span className="text-blue-400">#</span> index.css
                </div>
                <div className="flex items-center gap-2 text-sm text-teal-300 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700/50">
                  <span className="text-blue-500">TS</span> App.tsx
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 px-3 py-1.5 hover:text-slate-300 cursor-pointer">
                  <span className="text-blue-500">TS</span> main.tsx
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Online (3)</div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-900">Y</div>
                  <span className="text-xs text-slate-400">You</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-900">E</div>
                  <span className="text-xs text-slate-400">Emma</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-900">M</div>
                  <span className="text-xs text-slate-400">Mike</span>
                </div>
              </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col bg-[#0d1117]">
              {/* Tabs */}
              <div className="flex bg-[#010409] border-b border-slate-800 overflow-x-auto">
                <div className="px-4 py-3 text-sm text-slate-300 bg-[#0d1117] border-t-2 border-t-teal-500 border-r border-slate-800 flex items-center gap-2 min-w-[120px]">
                  <span className="text-blue-500">TS</span> App.tsx
                  <span className="ml-auto text-slate-500 hover:text-slate-300">×</span>
                </div>
                <div className="px-4 py-3 text-sm text-slate-500 border-r border-slate-800 flex items-center gap-2 min-w-[120px]">
                  <span className="text-blue-400">#</span> index.css
                </div>
              </div>

              {/* Code */}
              <div className="flex-1 p-6 font-mono text-sm leading-7 text-slate-300 relative overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  <div className="text-purple-400">function <span className="text-blue-300">Dashboard</span>() &#123;</div>
                  <div className="pl-4">
                    <span className="text-purple-400">const</span> [stats, setStats] = <span className="text-yellow-200">useState</span>([]);
                  </div>
                  <div className="pl-4">
                    <span className="text-purple-400">const</span> &#123; users &#125; = <span className="text-yellow-200">useCollaboration</span>();
                  </div>
                  <br />
                  <div className="pl-4">
                    <span className="text-purple-400">useEffect</span>(() <span className="text-purple-400">=&gt;</span> &#123;
                  </div>
                  
                  {/* Animated Typing Area */}
                  <div className="pl-8 relative">
                    <span className="text-yellow-200">fetchStats</span>().<span className="text-yellow-200">then</span>(data <span className="text-purple-400">=&gt;</span> setStats(data));
                    
                    {/* Collaborative Cursor: Emma */}
                    <motion.div 
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
                      className="absolute top-1 left-[24rem] w-0.5 h-5 bg-purple-500"
                    />
                    <div className="absolute -top-5 left-[23rem] bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg opacity-80">
                      Emma
                    </div>
                  </div>
                  
                  <div className="pl-4">&#125;, []);</div>
                  <br />
                  <div className="pl-4 relative">
                    <span className="text-purple-400">return</span> (
                    
                    {/* Collaborative Cursor: Mike */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1, delay: 0.5, times: [0, 0.5, 1] }}
                      className="absolute top-1 left-24 w-0.5 h-5 bg-blue-500"
                    />
                    <div className="absolute -top-5 left-20 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg opacity-80">
                      Mike
                    </div>
                  </div>
                  <div className="pl-8 text-slate-400">&lt;<span className="text-teal-300">div</span> <span className="text-blue-300">className</span>=<span className="text-green-300">"grid gap-4"</span>&gt;</div>
                  <div className="pl-12 text-slate-400">&lt;<span className="text-teal-300">StatsGrid</span> <span className="text-blue-300">data</span>=&#123;stats&#125; /&gt;</div>
                  <div className="pl-12 text-slate-400">&lt;<span className="text-teal-300">ActiveUsers</span> <span className="text-blue-300">users</span>=&#123;users&#125; /&gt;</div>
                  <div className="pl-8 text-slate-400">&lt;/<span className="text-teal-300">div</span>&gt;</div>
                  <div className="pl-4">);</div>
                  <div>&#125;</div>
                </motion.div>
                
                {/* Floating "Live" badge */}
                <div className="absolute bottom-6 right-6 flex items-center gap-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full px-4 py-2 shadow-lg">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-slate-300">3 Online</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
