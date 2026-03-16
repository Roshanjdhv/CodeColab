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
  ArrowRight,
  Shield,
  ShieldAlert
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
  const hash = (room._id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
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
    const isPublic = room.type === "public";
    
    if (isMyRoom) {
      return { label: "Open", onClick: () => onJoinRoom(room._id) };
    } else if (isJoinedRoom) {
      return { label: "Enter", onClick: () => onJoinRoom(room._id) };
    } else {
      return { label: isPublic ? "Join Now" : "Request", onClick: () => handleJoinRoom(room) };
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
  ).filter(room => {
    const search = searchQuery.toLowerCase();
    const name = (room.name || "").toLowerCase();
    const lang = (room.language || "").toLowerCase();
    return name.includes(search) || lang.includes(search);
  });

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative bg-card/60 backdrop-blur-xl rounded-3xl py-12 px-6 md:px-12 overflow-hidden mb-12 border border-border shadow-2xl dark:shadow-none transition-all duration-300">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full filter blur-[100px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full filter blur-[80px] -ml-24 -mb-24"></div>
        </div>
        
        <div className="relative z-10 w-full">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">
              Explore Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Rooms</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto md:mx-0">
              Join active collaboration sessions or start your own. Learn, build, and grow with developers worldwide.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search by room name, language or ID..."
                className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-medium shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <div className="relative flex-1 md:w-64 group">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Private Code"
                  className="w-full bg-card border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono tracking-wider shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-2xl font-bold flex items-center justify-center transition-all shadow-lg shadow-primary/20 active:scale-95 border border-primary/30"
              >
                <LogIn className="w-5 h-5" />
              </button>
            </form>
          </div>
          
          <div className="flex justify-center md:justify-start">
             <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full md:w-auto bg-primary/10 hover:bg-primary/20 text-primary px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border border-primary/10 active:scale-95 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                Create New Room
              </button>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-col mb-10">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-border pb-px">
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
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
              {filter === option.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]"
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
          const isPublic = room.type === "public";
          return (
            <div
              key={room._id}
              className="group bg-card rounded-3xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl shadow-lg dark:shadow-none hover:shadow-primary/5 flex flex-col"
            >
              <div 
                className="h-40 relative overflow-hidden transition-all duration-500 group-hover:scale-[1.02]"
                style={{ backgroundColor: getRoomColor(room) }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                <div className="w-full h-full flex items-center justify-center text-white">
                  <Terminal className="w-12 h-12 opacity-30 group-hover:scale-110 transition-all duration-500 group-hover:opacity-60" />
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg backdrop-blur-md border flex items-center gap-1.5 ${
                    isPublic 
                      ? "bg-emerald-500 text-white border-emerald-400" 
                      : "bg-amber-500 text-white border-amber-400"
                  }`}>
                    {isPublic ? <Globe className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {isPublic ? "Public" : "Private"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {room.name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm truncate">Owner: <span className="text-foreground font-medium">{room.creatorName || "Anonymous"}</span></span>
                </div>

                <p className="text-muted-foreground text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {room.description || "Join the conversation and start building something amazing together."}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="px-3 py-1 rounded-lg bg-muted border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                    #{room.language}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-bold">{room.memberCount || 1} members</span>
                  </div>
                  
                  <button
                    onClick={() => buttonAction.onClick()}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20`}
                  >
                    {buttonAction.label}
                    {(buttonAction.label === "Join Now" || buttonAction.label === "Open" || buttonAction.label === "Enter") && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {uniqueRooms.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-card rounded-3xl border border-dashed border-border shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mb-6 border border-border">
            <Globe className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">No rooms found</h3>
          <p className="text-muted-foreground max-w-sm">
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
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md transition-colors duration-300" onClick={() => setShowPrivateRoomModal(false)}></div>
          <div className="bg-card rounded-3xl border border-border p-8 w-full max-w-md relative z-10 shadow-2xl overflow-hidden group">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500"></div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Join Private Room</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                This room is protected. Please enter the unique access code to continue.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="ENTER ACCESS CODE"
                  className="w-full bg-muted border border-border rounded-2xl py-4 px-6 text-center text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all font-mono tracking-widest text-lg"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-3 pt-2">
                   <button 
                    onClick={() => setShowPrivateRoomModal(false)}
                    className="py-4 rounded-2xl font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleJoinPrivateRoom(joinCode)}
                    disabled={!joinCode.trim()}
                    className="bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-95"
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
