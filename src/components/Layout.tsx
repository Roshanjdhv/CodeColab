import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { 
  Globe, 
  Users, 
  Bell, 
  MessageCircle, 
  User, 
  Terminal,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Layout() {
  const profile = useQuery(api.profiles.getCurrentProfile);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const joinRequests = useQuery(api.rooms.getJoinRequests);

  const totalRequests = (friendRequests?.length || 0) + (joinRequests?.length || 0);

  const tabs = [
    { id: "explore", path: "/explore", label: "Explore", icon: <Globe className="w-4 h-4" /> },
    { id: "public", path: "/public", label: "Public", icon: <Users className="w-4 h-4" /> },
    { 
      id: "requests", 
      path: "/requests", 
      label: "Requests", 
      icon: <Bell className="w-4 h-4" />,
      badge: totalRequests > 0 ? totalRequests : undefined
    },
    { id: "chat", path: "/chat", label: "Chat", icon: <MessageCircle className="w-4 h-4" /> },
    { id: "profile", path: "/profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background border-x border-border max-w-[100vw] overflow-hidden flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-slate-400 bg-clip-text text-transparent hidden sm:block">
                CodeCollab
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 p-1 bg-muted/50 rounded-2xl border border-border">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-bold transition-all relative rounded-xl flex items-center gap-2 ${
                      isActive
                        ? "text-primary-foreground bg-primary shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-2 ring-background z-10">
                      {tab.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            
            <div className="flex items-center gap-3 p-1 md:p-1.5 md:pr-4 rounded-2xl bg-card border border-border shadow-sm hover:border-primary transition-all cursor-pointer group">
              {profile?.profileImageUrl ? (
                <img 
                  src={profile.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
              ) : (
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm"
                  style={{ backgroundColor: profile?.userColor || "#5048e5" }}
                >
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:flex flex-col">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-0.5">Account</span>
                 <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-foreground group-hover:text-primary">
                      {profile?.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                 </div>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:block h-8 w-[1px] bg-border mx-1" />
            <div className="hidden md:block">
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop - darker for better contrast */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] lg:hidden"
              />

              {/* Drawer - Full Screen for maximum clarity */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed inset-0 w-full h-full bg-slate-950 z-[70] lg:hidden flex flex-col"
              >
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#121121]">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white tracking-tight">Navigation</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">CodeCollab</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 custom-scrollbar">
                  {tabs.map((tab) => (
                    <NavLink
                      key={tab.id}
                      to={tab.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `px-5 py-4 text-sm font-bold transition-all rounded-2xl flex items-center justify-between group ${
                          isActive
                            ? "text-white bg-primary shadow-xl shadow-primary/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10"
                        }`
                      }
                    >
                      <div className="flex items-center gap-4">
                        <div className={`transition-transform group-hover:scale-110 duration-300`}>
                          {tab.icon}
                        </div>
                        {tab.label}
                      </div>
                      {tab.badge ? (
                        <span className="bg-destructive text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shadow-lg ring-2 ring-background">
                          {tab.badge}
                        </span>
                      ) : (
                        <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-30 -rotate-90 transition-all" />
                      )}
                    </NavLink>
                  ))}
                </div>

                <div className="p-6 border-t border-white/5 bg-[#121121]/50 backdrop-blur-xl">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                         <div className="size-10 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shadow-inner">
                            {profile?.profileImageUrl ? (
                              <img src={profile.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: profile?.userColor }}>
                                {profile?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-xs font-bold text-white leading-none">{profile?.username}</span>
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Now</span>
                         </div>
                       </div>
                       <SignOutButton />
                    </div>
                    <div className="flex justify-between items-center opacity-30 px-1">
                      <span className="text-[9px] font-bold text-slate-500 tracking-widest">STABLE RELEASE</span>
                      <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase">v2.0.4</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>

      <div className="w-full px-6 py-8 flex-1 flex flex-col">
        {/* Render Route Content Here */}
        <div className="bg-transparent rounded-2xl p-0 flex-1 flex flex-col relative overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
