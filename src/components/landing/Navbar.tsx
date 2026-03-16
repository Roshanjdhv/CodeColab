import React, { useState, useEffect } from 'react';
import { motion, useScroll, AnimatePresence } from 'framer-motion';
import { Code2, Github, Menu, X, Terminal } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

export function Navbar({ onSignInClick, isAuthenticated = false }: { onSignInClick: () => void, isAuthenticated?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-card/80 backdrop-blur-md border-b border-border' : 'bg-transparent'
        }`}
      >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
            CodeCollab
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-muted-foreground uppercase tracking-widest">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
          <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <ThemeToggle />
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Github className="w-5 h-5" />
          </a>
          {!isAuthenticated && (
            <button 
              onClick={onSignInClick}
              className="px-4 py-2 rounded-lg font-bold text-sm border border-border hover:bg-muted transition-colors text-foreground"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={onSignInClick}
            className="px-4 py-2 rounded-lg font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
          >
            {isAuthenticated ? 'Dashboard' : 'Start Coding'}
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button 
            className="text-muted-foreground hover:text-foreground p-2 bg-muted/50 rounded-lg border border-border transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      </motion.nav>

      {/* Mobile Menu Overlay & Content - Outside transformed nav container */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-0 w-full h-[100dvh] bg-slate-950 z-[110] md:hidden shadow-2xl flex flex-col"
            >
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#121121] shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-tight">Navigation</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">CodeCollab</span>
                    </div>
                  </div>
                  <button 
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col space-y-6 custom-scrollbar">
                  <div className="flex flex-col space-y-3">
                    <a href="#features" className="text-lg text-slate-400 hover:text-white font-bold flex items-center transition-all px-5 py-4 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10" onClick={() => setMobileMenuOpen(false)}>
                      Features
                    </a>
                    <a href="#how-it-works" className="text-lg text-slate-400 hover:text-white font-bold flex items-center transition-all px-5 py-4 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10" onClick={() => setMobileMenuOpen(false)}>
                      How it Works
                    </a>
                    <a href="#benefits" className="text-lg text-slate-400 hover:text-white font-bold flex items-center transition-all px-5 py-4 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10" onClick={() => setMobileMenuOpen(false)}>
                      Benefits
                    </a>
                    <a href="#testimonials" className="text-lg text-slate-400 hover:text-white font-bold flex items-center transition-all px-5 py-4 rounded-2xl hover:bg-white/5 group border border-transparent hover:border-white/10" onClick={() => setMobileMenuOpen(false)}>
                      Testimonials
                    </a>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5 space-y-4 shrink-0 mt-auto">
                    {!isAuthenticated && (
                      <button 
                        onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                        className="w-full py-5 rounded-2xl font-bold text-lg border border-white/10 text-white hover:bg-white/5 transition-all flex items-center justify-center active:scale-[0.98]"
                      >
                        Sign In
                      </button>
                    )}
                    <button 
                      onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                      className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-white shadow-xl shadow-primary/20 transition-all flex items-center justify-center active:scale-[0.98] hover:translate-y-[-2px]"
                    >
                      {isAuthenticated ? 'Dashboard' : 'Start Coding Now'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
