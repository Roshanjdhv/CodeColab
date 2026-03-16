import React from 'react';
import { motion } from 'framer-motion';

const technologies = [
  { name: 'React', color: 'text-[#61DAFB]', bg: 'bg-[#61DAFB]/10' },
  { name: 'Next.js', color: 'text-foreground', bg: 'bg-foreground/10' },
  { name: 'Supabase', color: 'text-[#3ECF8E]', bg: 'bg-[#3ECF8E]/10' },
  { name: 'WebSockets', color: 'text-[#FF9900]', bg: 'bg-[#FF9900]/10' },
  { name: 'TailwindCSS', color: 'text-[#38B2AC]', bg: 'bg-[#38B2AC]/10' },
  { name: 'Node.js', color: 'text-[#339933]', bg: 'bg-[#339933]/10' },
];

export function TechStack() {
  return (
    <section className="w-full py-20 bg-background border-t border-border overflow-hidden relative transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50 dark:opacity-100"></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-4">
            Powered by modern technologies
          </h2>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
          {technologies.map((tech, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-3 px-6 py-3 rounded-full border border-border backdrop-blur-sm ${tech.bg} transition-colors cursor-default shadow-sm`}
            >
              <span className={`font-bold text-lg hover:text-foreground transition-colors ${tech.color}`}>
                {tech.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
