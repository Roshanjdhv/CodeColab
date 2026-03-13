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

export function LandingPage({ onSignInClick }: { onSignInClick: () => void }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <Navbar onSignInClick={onSignInClick} />
        <main className="w-full flex flex-col items-center">
          <Hero onStartCoding={onSignInClick} />
          <FeatureSlider />
          <HowItWorks />
          <ProductShowcase />
          <Benefits />
          <TechStack />
          <Testimonials />
          <CTA onStartCoding={onSignInClick} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
