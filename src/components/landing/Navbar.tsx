import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Code2, Github, Menu, X } from 'lucide-react';

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
        isScrolled ? 'bg-slate-900/80 backdrop-blur-md border-b border-indigo-500/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            CodeCollab
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#benefits" className="hover:text-white transition-colors">Benefits</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
          {!isAuthenticated && (
            <button 
              onClick={onSignInClick}
              className="px-4 py-2 rounded-lg font-medium text-sm border border-slate-700 hover:bg-slate-800 transition-colors"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={onSignInClick}
            className="px-4 py-2 rounded-lg font-medium text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all"
          >
            {isAuthenticated ? 'Dashboard' : 'Start Coding'}
          </button>
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-col space-y-4">
          <a href="#features" className="text-slate-300 hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="text-slate-300 hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
          <a href="#benefits" className="text-slate-300 hover:text-white font-medium" onClick={() => setMobileMenuOpen(false)}>Benefits</a>
          {!isAuthenticated && (
            <button 
              onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
              className="w-full py-2 rounded-lg font-medium text-sm border border-slate-600 mt-4"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={() => { setMobileMenuOpen(false); onSignInClick(); }}
            className="w-full py-2 rounded-lg font-medium text-sm bg-indigo-600 text-white"
          >
            {isAuthenticated ? 'Dashboard' : 'Start Coding'}
          </button>
        </div>
      )}
    </motion.nav>
  );
}
