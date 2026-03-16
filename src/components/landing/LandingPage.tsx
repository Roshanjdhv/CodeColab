import React from 'react';
import { Hero } from './Hero';
import { Navbar } from './Navbar';
import { FeatureSlider } from './FeatureSlider';
import { HowItWorks } from './HowItWorks';
import { ProductShowcase } from './ProductShowcase';
import { Benefits } from './Benefits';
import { TechStack } from './TechStack';
import { Testimonials } from './Testimonials';
import { CTA } from './CTA';
import { Footer } from './Footer';

export function LandingPage({ onSignInClick, isAuthenticated = false }: { onSignInClick: () => void, isAuthenticated?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 transition-colors duration-300">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Navbar onSignInClick={onSignInClick} isAuthenticated={isAuthenticated} />
        <main className="w-full flex flex-col items-center">
          <Hero onStartCoding={onSignInClick} isAuthenticated={isAuthenticated} />
          <FeatureSlider />
          <HowItWorks />
          <ProductShowcase />
          <Benefits />
          <TechStack />
          <Testimonials />
          <CTA onStartCoding={onSignInClick} isAuthenticated={isAuthenticated} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
