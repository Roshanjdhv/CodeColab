import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Code2, Play, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: <LogIn className="w-6 h-6 text-white" />,
    title: "Create or Join a Room",
    description: "Start a new coding session instantly or join an existing room using a secure invite link.",
    color: "from-blue-500 to-indigo-500",
    delay: 0.1
  },
  {
    icon: <UserPlus className="w-6 h-6 text-white" />,
    title: "Invite Your Team",
    description: "Share access with your teammates or students effortlessly for real-time collaboration.",
    color: "from-indigo-500 to-purple-500",
    delay: 0.3
  },
  {
    icon: <Code2 className="w-6 h-6 text-white" />,
    title: "Code Together",
    description: "Write and edit code simultaneously with live cursors showing exactly who is doing what.",
    color: "from-purple-500 to-pink-500",
    delay: 0.5
  },
  {
    icon: <Play className="w-6 h-6 text-white" />,
    title: "Run and Test Instantly",
    description: "Execute your collaborative code directly in the browser and debug as a team.",
    color: "from-pink-500 to-rose-500",
    delay: 0.7
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            How it <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">works</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Get started in seconds. No complicated setup, just seamless collaborative coding right in your browser.
          </motion.p>
        </div>

        <div className="relative mt-8">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-slate-800 via-indigo-500/50 to-slate-800 z-0" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: step.delay }}
                className="flex flex-col items-center relative group"
              >
                {/* Connector Arrow for mobile */}
                {index !== steps.length - 1 && (
                  <div className="md:hidden absolute -bottom-6 flex justify-center w-full">
                    <ArrowRight className="w-5 h-5 text-slate-700 rotate-90" />
                  </div>
                )}

                {/* Step Icon */}
                <div className="relative mb-6">
                  {/* Glowing background */}
                  <div className={`absolute inset-0 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-300 bg-gradient-to-br ${step.color}`} />
                  
                  {/* Icon container */}
                  <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br ${step.color} shadow-lg shadow-indigo-500/20 z-10 
                    transform group-hover:scale-110 transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]`}
                  >
                    <div className="absolute top-[-10px] right-[-10px] w-6 h-6 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm z-20">
                      {index + 1}
                    </div>
                    {step.icon}
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl font-bold text-white mb-3 text-center group-hover:text-indigo-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-slate-400 text-center leading-relaxed text-sm">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
