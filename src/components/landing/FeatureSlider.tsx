import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, MousePointer2, Zap, LayoutDashboard, Shield, Cloud, Sparkles } from 'lucide-react';

const features = [
  {
    icon: <Users className="w-8 h-8 text-indigo-400" />,
    title: "Real-Time Collaborative Code Editor",
    description: "Write and edit code simultaneously with your team members in a shared workspace."
  },
  {
    icon: <Code className="w-8 h-8 text-purple-400" />,
    title: "Multi-language Support",
    description: "Built-in support for HTML, CSS, JS, Python, C, C++ and many more languages."
  },
  {
    icon: <MousePointer2 className="w-8 h-8 text-blue-400" />,
    title: "Live Cursor Tracking",
    description: "See exactly where your teammates are working with real-time cursor presence."
  },
  {
    icon: <Zap className="w-8 h-8 text-amber-400" />,
    title: "Instant Code Sync",
    description: "Changes are synchronized across all connected users instantly."
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-emerald-400" />,
    title: "Room-Based Collaboration",
    description: "Create isolated coding rooms and invite specific team members to join."
  },
  {
    icon: <Shield className="w-8 h-8 text-rose-400" />,
    title: "Secure Authentication",
    description: "Enterprise-grade security and authentication to keep your code safe."
  },
  {
    icon: <Cloud className="w-8 h-8 text-sky-400" />,
    title: "Cloud-Based Storage",
    description: "All your workspaces are securely saved in the cloud automatically."
  },
  {
    icon: <Sparkles className="w-8 h-8 text-fuchsia-400" />,
    title: "AI Code Assistance",
    description: "Future-ready architecture for integrated AI coding suggestions."
  }
];

export function FeatureSlider() {
  // Duplicate features to create a seamless infinite loop
  const duplicatedFeatures = [...features, ...features];

  return (
    <section id="features" className="w-full py-24 bg-slate-900 overflow-hidden relative border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 relative z-20">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">build faster</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            CodeCollab provides a comprehensive suite of tools designed to make pair programming and team collaboration effortless.
          </motion.p>
        </div>
      </div>

      <div className="relative w-full overflow-hidden pb-8">
        {/* Subtle gradient edges to mask the slider */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-48 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

        <motion.div 
          className="flex gap-6 w-max" 
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30, // Adjust speed (higher is slower)
              ease: "linear",
            },
          }}
        >
          {duplicatedFeatures.map((feature, idx) => (
            <div
              key={idx}
              className="w-[300px] md:w-[380px] flex-shrink-0"
            >
              <div className="h-full bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800 hover:border-indigo-500/30 transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col group cursor-default">
                <div className="bg-slate-900/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm flex-1">{feature.description}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
