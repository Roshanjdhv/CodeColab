import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Users, Share2, Rocket } from 'lucide-react';

const benefits = [
  {
    icon: <Rocket className="w-10 h-10 text-indigo-400" />,
    title: "Faster Team Collaboration",
    description: "Eliminate the back-and-forth of sharing code snippets or screen sharing. Work together in real time and ship features faster."
  },
  {
    icon: <Users className="w-10 h-10 text-purple-400" />,
    title: "Remote Pair Programming",
    description: "Experience the benefits of pair programming regardless of physical location with synchronized scrolling and cursor tracking."
  },
  {
    icon: <Terminal className="w-10 h-10 text-blue-400" />,
    title: "Improved Learning for Students",
    description: "Perfect for educators and learners. Instructors can guide students directly within their code environment in real time."
  },
  {
    icon: <Share2 className="w-10 h-10 text-emerald-400" />,
    title: "Real-Time Code Sharing",
    description: "Instantly share executable code with a single link. No environment setup required for participants."
  }
];

export function Benefits() {
  return (
    <section id="benefits" className="w-full py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
          >
            Why choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">CodeCollab?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto"
          >
            Built from the ground up to empower development teams, educators, and individual creators.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8 rounded-3xl transition-all hover:bg-slate-800/80 hover:border-indigo-500/30 group shadow-lg hover:shadow-indigo-500/10"
            >
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="bg-slate-900/50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {benefit.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
