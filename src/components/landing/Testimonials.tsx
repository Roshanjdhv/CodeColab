import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Perfect for pair programming. CodeCollab changed how our remote team operates. The latency is practically zero.",
    author: "Sarah Jenkins",
    role: "Senior Frontend Engineer",
    avatar: "S"
  },
  {
    quote: "Makes coding with teammates effortless. We use it daily for quick debugging sessions and architectural discussions.",
    author: "David Chen",
    role: "Tech Lead at StartUp Inc.",
    avatar: "D"
  },
  {
    quote: "Great learning tool for students. I can walk my entire class through complex algorithms in real time.",
    author: "Prof. Elena Rodriguez",
    role: "Computer Science Dept.",
    avatar: "E"
  }
];

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="testimonials" className="w-full py-24 bg-background border-t border-border relative transition-colors duration-300">
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 blur-[100px] rounded-full opacity-50 dark:opacity-100" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex justify-center items-center mb-8"
        >
          <Quote className="w-12 h-12 text-primary/30" />
        </motion.div>

        <div className="h-64 relative flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <p className="text-2xl md:text-4xl font-bold text-foreground leading-relaxed mb-8">
                &ldquo;{testimonials[index].quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {testimonials[index].avatar}
                </div>
                <div className="text-left">
                  <div className="text-foreground font-bold">{testimonials[index].author}</div>
                  <div className="text-muted-foreground text-sm font-medium">{testimonials[index].role}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8 gap-3">
          {testimonials.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === idx ? 'bg-primary w-8' : 'bg-muted hover:bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
