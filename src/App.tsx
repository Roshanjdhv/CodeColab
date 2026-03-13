import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { ProfileSetup } from "./components/ProfileSetup";
import { LandingPage } from "./components/landing/LandingPage";
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ExploreTab } from "./components/tabs/ExploreTab";
import { PublicTab } from "./components/tabs/PublicTab";
import { RequestsTab } from "./components/tabs/RequestsTab";
import { ChatTab } from "./components/tabs/ChatTab";
import { ProfileTab } from "./components/tabs/ProfileTab";
import { RoomView } from "./components/RoomView";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster position="top-right" />
    </div>
  );
}

function AuthenticatedApp() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  if (currentRoomId) {
    return (
      <RoomView 
        roomId={currentRoomId} 
        onLeave={() => setCurrentRoomId(null)} 
      />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/explore" replace />} />
          <Route path="explore" element={<ExploreTab onJoinRoom={setCurrentRoomId} />} />
          <Route path="public" element={<PublicTab />} />
          <Route path="requests" element={<RequestsTab />} />
          <Route path="chat" element={<ChatTab />} />
          <Route path="profile" element={<ProfileTab />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function UnauthenticatedApp() {
  const [showSignIn, setShowSignIn] = useState(false);

  if (showSignIn) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-900 text-slate-50 selection:bg-indigo-500/30">
        <header className="bg-slate-900/80 backdrop-blur-sm border-b border-indigo-500/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button 
              onClick={() => setShowSignIn(false)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm text-center ml-[0.1rem]">C</span>
                <span className="text-white font-bold text-sm text-center -ml-[0.1rem]">C</span>
              </div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                CodeCollab
              </h1>
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="w-full max-w-md relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome Back
              </h2>
              <p className="text-lg text-slate-400">
                Sign in to continue to your workspace
              </p>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-slate-700/50">
              <SignInForm />
            </div>
            
            <button 
              onClick={() => setShowSignIn(false)}
              className="mt-6 text-sm text-slate-400 hover:text-white transition-colors w-full text-center"
            >
              ← Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return <LandingPage onSignInClick={() => setShowSignIn(true)} />;
}
