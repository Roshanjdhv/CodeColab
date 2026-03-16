import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
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

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={false}
        animate={mobileMenuOpen ? "open" : "closed"}
        variants={{
          open: { opacity: 1, height: 'auto', display: 'block' },
          closed: { opacity: 0, height: 0, transitionEnd: { display: 'none' } }
        }}
        className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
      >
        <div className="px-6 py-8 flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <a href="#features" className="text-lg text-muted-foreground hover:text-foreground font-bold flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-lg text-muted-foreground hover:text-foreground font-bold flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#benefits" className="text-lg text-muted-foreground hover:text-foreground font-bold flex items-center transition-colors px-4 py-2 rounded-xl hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
          </div>
          
          <div className="pt-4 border-t border-border space-y-4">
            {!isAuthenticated && (
              <button 
                onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
                className="w-full py-4 rounded-xl font-bold text-lg border border-border text-foreground hover:bg-muted transition-all flex items-center justify-center"
              >
                Sign In
              </button>
            )}
            <button 
              onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
              className="w-full py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all flex items-center justify-center active:scale-[0.98]"
            >
              {isAuthenticated ? 'Dashboard' : 'Start Coding'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
