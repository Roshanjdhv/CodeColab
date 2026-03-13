import { Outlet, NavLink } from "react-router-dom";
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
  ChevronDown
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4 sticky top-0 z-50">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CC</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CodeCollab
              </h1>
            </div>

            {/* Navigation in Header */}
            <nav className="hidden lg:flex items-center gap-1 ml-4 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-4 py-2 text-sm font-bold transition-all relative rounded-xl flex items-center gap-2 ${
                      isActive
                        ? "text-primary bg-white shadow-sm ring-1 ring-slate-200/50"
                        : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                    }`
                  }
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg ring-2 ring-white z-10 animate-in zoom-in">
                      {tab.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer group">
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
              <div className="flex flex-col">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Account</span>
                 <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">
                      {profile?.username}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                 </div>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <SignOutButton />
          </div>
        </div>
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
