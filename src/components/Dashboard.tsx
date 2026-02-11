import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { ExploreTab } from "./tabs/ExploreTab";
import { PublicTab } from "./tabs/PublicTab";
import { RequestsTab } from "./tabs/RequestsTab";
import { ChatTab } from "./tabs/ChatTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { RoomView } from "./RoomView";

type Tab = "explore" | "public" | "requests" | "chat" | "profile";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("explore");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const profile = useQuery(api.profiles.getCurrentProfile);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const joinRequests = useQuery(api.rooms.getJoinRequests);

  if (currentRoomId) {
    return (
      <RoomView 
        roomId={currentRoomId} 
        onLeave={() => setCurrentRoomId(null)} 
      />
    );
  }

  const totalRequests = (friendRequests?.length || 0) + (joinRequests?.length || 0);

  const tabs = [
    { id: "explore" as const, label: "Explore", icon: "🌍" },
    { id: "public" as const, label: "Public", icon: "👥" },
    { 
      id: "requests" as const, 
      label: "Requests", 
      icon: "📨",
      badge: totalRequests > 0 ? totalRequests : undefined
    },
    { id: "chat" as const, label: "Chat", icon: "💬" },
    { id: "profile" as const, label: "Profile", icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CodeCollab
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {profile?.profileImageUrl && (
                <img 
                  src={profile.profileImageUrl} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-gray-700">
                {profile?.username}
              </span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-all relative ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "explore" && (
              <ExploreTab onJoinRoom={setCurrentRoomId} />
            )}
            {activeTab === "public" && <PublicTab />}
            {activeTab === "requests" && <RequestsTab />}
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "profile" && <ProfileTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
