import React from 'react';
import { Code2, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-background pt-20 pb-10 border-t border-border relative z-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                CodeCollab
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 font-medium">
              Empowering development teams to build better software together with real-time collaborative editing.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 tracking-wide">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 tracking-wide">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Partners</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-foreground mb-6 tracking-wide">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CodeCollab. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="font-medium">Made with <span className="text-purple-500">♥</span> for developers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
