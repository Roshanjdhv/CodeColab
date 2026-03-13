import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-slate-50 border-x border-slate-200/50 max-w-[100vw] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 sticky top-0 z-50">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-4 md:space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent hidden sm:block">
                CodeCollab
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-bold transition-all relative rounded-xl flex items-center gap-2 ${
                      isActive
                        ? "text-white bg-indigo-600 shadow-lg shadow-indigo-600/20"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-2 ring-white z-10">
                      {tab.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-3 p-1 md:p-1.5 md:pr-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-indigo-200 transition-all cursor-pointer group">
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
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Account</span>
                 <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                      {profile?.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                 </div>
              </div>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="hidden md:block h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="hidden md:block">
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <motion.div
          initial={false}
          animate={mobileMenuOpen ? "open" : "closed"}
          variants={{
            open: { opacity: 1, height: 'auto', display: 'block', marginTop: '1rem' },
            closed: { opacity: 0, height: 0, transitionEnd: { display: 'none' }, marginTop: 0 }
          }}
          className="lg:hidden border-t border-slate-100 pt-4 overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-2">
            {tabs.map((tab) => (
              <NavLink
                key={tab.id}
                to={tab.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 text-sm font-bold transition-all rounded-xl flex items-center justify-between ${
                    isActive
                      ? "text-white bg-indigo-600 shadow-lg shadow-indigo-600/20"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {tab.icon}
                  {tab.label}
                </div>
                {tab.badge && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
              <SignOutButton />
              <div className="text-xs text-slate-400">v2.0.4</div>
            </div>
          </div>
        </motion.div>
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
