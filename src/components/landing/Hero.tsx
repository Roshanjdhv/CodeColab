import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Users, Play, Code2 } from 'lucide-react';

export function Hero({ onStartCoding, isAuthenticated = false }: { onStartCoding: () => void, isAuthenticated?: boolean }) {
  return (
    <section className="relative w-full pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between z-10 gap-16">
        {/* Left Column: Text */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col items-start text-left"
        >
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full text-sm font-medium mb-6 border border-indigo-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>CodeCollab v2.0 is live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Collaborate, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Code</span>, <br className="hidden md:block"/> and Build Together
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
            CodeCollab allows multiple developers to write, edit, and execute code simultaneously in real time. Experience the future of team software development.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button 
              onClick={onStartCoding}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-2 group"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Coding'}
              <Terminal className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 border border-slate-700">
              <Play className="w-5 h-5" />
              View Demo
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-400" />
              <span>Multi-user Editing</span>
            </div>
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>Syntax Highlighting</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Editor Illustration */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="flex-1 w-full max-w-2xl relative"
        >
          {/* Decorative glow behind editor */}
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-2xl blur-2xl"></div>
          
          <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Window Controls */}
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              <div className="ml-4 text-xs text-slate-500 font-mono">main.tsx</div>
            </div>
            
            {/* Editor Content */}
            <div className="p-6 font-mono text-sm leading-relaxed text-slate-300">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="space-y-1"
              >
                <div className="text-purple-400">import <span className="text-indigo-300">&#123;</span> useState, useEffect <span className="text-indigo-300">&#125;</span> from <span className="text-green-300">'react'</span>;</div>
                <div className="text-purple-400">import <span className="text-slate-300">useWebSocket</span> from <span className="text-green-300">'@/hooks'</span>;</div>
                <br />
                <div><span className="text-blue-400">export function</span> <span className="text-yellow-200">CollabEditor</span>() &#123;</div>
                <div className="pl-4">
                  <span className="text-blue-400">const</span> [code, setCode] = <span className="text-yellow-200">useState</span>(<span className="text-green-300">''</span>);
                </div>
                <div className="pl-4">
                  <span className="text-blue-400">const</span> &#123; send, onMessage &#125; = <span className="text-yellow-200">useWebSocket</span>();
                </div>
                <br />
                <div className="pl-4 relative">
                  <span className="text-blue-400">const</span> <span className="text-yellow-200">handleTyping</span> = (e) <span className="text-blue-400">=&gt;</span> &#123;
                  
                  {/* Cursor Animation 1 */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, times: [0, 0.5, 1] }}
                    className="absolute top-1 left-[14rem] w-0.5 h-4 bg-blue-500"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.3 }}
                    className="absolute -top-6 left-[13rem] bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg"
                  >
                    Alex
                  </motion.div>
                </div>
                <div className="pl-8 text-slate-500">// Sync code instantly</div>
                <div className="pl-8">
                  <span className="text-yellow-200">setCode</span>(e.target.value);
                </div>
                <div className="pl-8">
                  <span className="text-yellow-200">send</span>(&#123; <span className="text-slate-300">type</span>: <span className="text-green-300">'UPDATE'</span>, <span className="text-slate-300">content</span>: e.target.value &#125;);
                </div>
                
                <div className="pl-4 relative mt-2">
                  &#125;;
                  {/* Cursor Animation 2 */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.5, times: [0, 0.5, 1] }}
                    className="absolute top-1 left-4 w-0.5 h-4 bg-purple-500"
                  />
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 0.3 }}
                    className="absolute -top-6 left-2 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded shadow-lg"
                  >
                    Sarah
                  </motion.div>
                </div>
                <br />
                <div className="pl-4 text-purple-400">return <span className="text-slate-300">(</span></div>
                <div className="pl-8 text-slate-400">&lt;<span className="text-blue-400">EditorUI</span> <span className="text-indigo-300">value</span>=&#123;code&#125; <span className="text-indigo-300">onChange</span>=&#123;handleTyping&#125; /&gt;</div>
                <div className="pl-4 text-slate-300">);</div>
                <div>&#125;</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
