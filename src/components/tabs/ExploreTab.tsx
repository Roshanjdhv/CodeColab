import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { CreateRoomModal } from "../modals/CreateRoomModal";
import { motion } from "framer-motion";
import { 
  Key, 
  LogIn, 
  Search, 
  Users, 
  User, 
  Plus, 
  ChevronDown, 
  Terminal,
  Globe,
  ArrowRight
} from "lucide-react";

const ROOM_COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f43f5e", // Rose
  "#f59e0b", // Amber
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
  "#14b8a6", // Teal
  "#a855f7", // Purple
];

const getRoomColor = (room: any) => {
  if (room.color) return room.color;
  const hash = room._id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  return ROOM_COLORS[hash % ROOM_COLORS.length];
};

interface ExploreTabProps {
  onJoinRoom: (roomId: string) => void;
}

export function ExploreTab({ onJoinRoom }: ExploreTabProps) {
  const [filter, setFilter] = useState<"all" | "public" | "my" | "joined">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPrivateRoomModal, setShowPrivateRoomModal] = useState(false);
  const [selectedPrivateRoom, setSelectedPrivateRoom] = useState<any>(null);
  const [joinCode, setJoinCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const allRooms = useQuery(api.rooms.getAllRooms);
  const publicRooms = useQuery(api.rooms.getPublicRooms);
  const myRooms = useQuery(api.rooms.getMyRooms);
  const joinedRooms = useQuery(api.rooms.getJoinedRooms);
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleJoinRoom = async (room: any) => {
    if (room.type === "private") {
      setSelectedPrivateRoom(room);
      setShowPrivateRoomModal(true);
      return;
    }

    try {
      const result = await joinRoom({ roomId: room._id as Id<"rooms"> });
      if (result.success && result.roomId) {
        toast.success("Successfully joined room!");
        onJoinRoom(result.roomId);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join room");
    }
  };

  const handleJoinPrivateRoom = async (code: string) => {
    try {
      const result = await joinRoom({ uniqueCode: code });
      if (result.success && result.roomId) {
        toast.success("Successfully joined private room!");
        onJoinRoom(result.roomId);
        setShowPrivateRoomModal(false);
        setJoinCode("");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join room");
    }
  };

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    handleJoinPrivateRoom(joinCode.trim().toUpperCase());
  };

  const getButtonAction = (room: any) => {
    const isMyRoom = myRooms?.some(r => r._id === room._id);
    const isJoinedRoom = joinedRooms?.some(r => r._id === room._id);
    
    if (isMyRoom) {
      return { label: "Open", onClick: () => onJoinRoom(room._id) };
    } else if (isJoinedRoom) {
      return { label: "Enter", onClick: () => onJoinRoom(room._id) };
    } else {
      return { label: room.isPublic ? "Join Now" : "Request", onClick: () => handleJoinRoom(room) };
    }
  };

  const filteredRooms = filter === "all" 
    ? allRooms || []
    : filter === "public" 
    ? publicRooms || []
    : filter === "my"
    ? myRooms || []
    : joinedRooms || [];

  const uniqueRooms = filteredRooms.filter((room, index, self) => 
    index === self.findIndex(r => r._id === room._id)
  ).filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative bg-slate-800/40 backdrop-blur-xl rounded-3xl py-12 px-6 md:px-12 overflow-hidden mb-12 border border-slate-700/50">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full filter blur-[80px] -ml-24 -mb-24"></div>
        </div>
        
        <div className="relative z-10 w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Explore Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Rooms</span>
            </h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto md:mx-0">
              Join active collaboration sessions or start your own. Learn, build, and grow with developers worldwide.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search by room name, language or ID..."
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <div className="relative flex-1 md:w-64 group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Private Code"
                  className="w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-wider"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/30"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="flex justify-center md:justify-start">
             <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto bg-white/10 hover:bg-white/15 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-95 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Create New Room
              </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-800 pb-px">
          {[
            { id: "all", label: "All Rooms" },
            { id: "public", label: "Public" },
            { id: "my", label: "My Rooms" },
            { id: "joined", label: "Joined" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id as any)}
              className={`px-6 py-4 transition-all whitespace-nowrap font-bold text-sm tracking-tight relative ${
                filter === option.id
                  ? "text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {option.label}
              {filter === option.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {uniqueRooms.map((room) => {
          const buttonAction = getButtonAction(room);
          return (
            <div
              key={room._id}
              className="group bg-slate-800/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 overflow-hidden hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
            >
              <div 
                className="h-40 relative overflow-hidden transition-all duration-500 group-hover:scale-[1.02]"
                style={{ backgroundColor: getRoomColor(room) }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Terminal className="w-12 h-12 opacity-40 group-hover:scale-110 transition-all duration-500 group-hover:opacity-70" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md border ${
                    room.isPublic 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}>
                    {room.isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate">
                    {room.name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">Owner: <span className="text-slate-300 font-medium">{room.creatorName || "Anonymous"}</span></span>
                </div>

                <p className="text-slate-400 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {room.description || "Join the conversation and start building something amazing together."}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1 rounded-lg bg-slate-900/50 border border-slate-700/50 text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                    #{room.language}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold">{room.memberCount || 1} members</span>
                  </div>
                  
                  <button
                    onClick={() => buttonAction.onClick()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20`}
                  >
                    {buttonAction.label}
                    {buttonAction.label === "Join Now" && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {uniqueRooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700/50">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6 border border-slate-700/50">
            <Globe className="w-10 h-10 text-slate-500/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No rooms found</h3>
          <p className="text-slate-500 max-w-sm">
            Try adjusting your search query or filters to find what you're looking for.
          </p>
        </div>
      )}

      {showCreateModal && (
        <CreateRoomModal 
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={onJoinRoom}
        />
      )}

      {showPrivateRoomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowPrivateRoomModal(false)}></div>
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Join Private Room</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">
                This room is protected. Please enter the unique access code to continue.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 px-6 text-center text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-widest text-lg"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button 
                    onClick={() => setShowPrivateRoomModal(false)}
                    className="py-4 rounded-2xl font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleJoinPrivateRoom(joinCode)}
                    disabled={!joinCode.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
