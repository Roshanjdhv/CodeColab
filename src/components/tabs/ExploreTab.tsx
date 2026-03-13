import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { CreateRoomModal } from "../modals/CreateRoomModal";
import { 
  Key, 
  LogIn, 
  Search, 
  Users, 
  User, 
  Plus, 
  ChevronDown, 
  Terminal,
  Globe
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
  // Deterministic fallback based on room ID
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
  
  const allRooms = useQuery(api.rooms.getAllRooms);
  const publicRooms = useQuery(api.rooms.getPublicRooms);
  const myRooms = useQuery(api.rooms.getMyRooms);
  const joinedRooms = useQuery(api.rooms.getJoinedRooms);
  const currentProfile = useQuery(api.profiles.getCurrentProfile);
  const joinRoom = useMutation(api.rooms.joinRoom);

  const handleJoinRoom = async (room: any) => {
    // If it's a private room, show the modal to enter code
    if (room.type === "private") {
      setSelectedPrivateRoom(room);
      setShowPrivateRoomModal(true);
      return;
    }

    // For public rooms, join directly
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
    if (!selectedPrivateRoom) return;

    try {
      const result = await joinRoom({ uniqueCode: code });
      
      if (result.success && result.roomId) {
        toast.success("Successfully joined private room!");
        onJoinRoom(result.roomId);
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

    try {
      const result = await joinRoom({ uniqueCode: joinCode.trim().toUpperCase() });
      
      if (result.success && result.roomId) {
        toast.success("Successfully joined room!");
        onJoinRoom(result.roomId);
        setJoinCode("");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to join room");
    }
  };

  const getButtonAction = (room: any) => {
    const isMyRoom = myRooms?.some(r => r._id === room._id);
    const isJoinedRoom = joinedRooms?.some(r => r._id === room._id);
    
    if (isMyRoom) {
      return { text: "Open", action: () => onJoinRoom(room._id), className: "bg-green-600 hover:bg-green-700" };
    } else if (isJoinedRoom) {
      return { text: "Enter", action: () => onJoinRoom(room._id), className: "bg-blue-600 hover:bg-blue-700" };
    } else {
      return { text: "Join", action: () => handleJoinRoom(room), className: "bg-blue-600 hover:bg-blue-700" };
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
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative bg-primary/5 rounded-2xl py-12 px-6 overflow-hidden mb-8 border border-primary/10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full filter blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary rounded-full filter blur-3xl -ml-24 -mb-24"></div>
        </div>
        <div className="w-full text-center relative z-10">
          <h2 className="text-3xl md:text-6xl font-extrabold text-slate-900 mb-6">
            Explore Coding Rooms
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-4xl mx-auto leading-relaxed">
            Join private rooms or discover public communities to collaborate on projects in real-time.
          </p>
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleJoinByCode} className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-2xl shadow-2xl shadow-primary/10 border border-slate-200">
              <div className="flex flex-1 items-center px-4 bg-slate-50 rounded-lg group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <Key className="w-5 h-5 text-slate-400 mr-2" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter private room code..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-900 placeholder:text-slate-500 text-sm md:text-base py-3"
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-primary/20"
              >
                <LogIn className="w-5 h-5" />
                Join Room
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">
              Looking to start fresh?{" "}
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-primary font-semibold hover:underline"
              >
                Create a new room
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* Room Explorer Content */}
      <div className="w-full">
        {/* Filters/Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-200">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "all", label: "All Rooms" },
              { id: "public", label: "Public" },
              { id: "my", label: "My Rooms" },
              { id: "joined", label: "Joined" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilter(option.id as any)}
                className={`px-6 py-4 border-b-2 transition-all whitespace-nowrap font-semibold ${
                  filter === option.id
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-primary"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 pb-4 md:pb-4">
            <div className="relative flex-grow md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or tag..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {uniqueRooms.map((room) => {
            const buttonAction = getButtonAction(room);
            return (
              <div
                key={room._id}
                className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/5 flex flex-col"
              >
                <div 
                  className="h-40 relative overflow-hidden transition-all duration-500 group-hover:scale-[1.05]"
                  style={{ backgroundColor: getRoomColor(room) }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent"></div>
                  {/* Abstract placeholder for room image */}
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Terminal className="w-16 h-16 opacity-40 group-hover:scale-110 transition-all duration-500 group-hover:opacity-60" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${
                      room.type === "public"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {room.type}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col font-display">
                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors truncate">
                    {room.name}
                  </h3>
                  <div className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                    <User className="w-4 h-4" />
                    <span className="truncate">Owner: {room.creatorName}</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                    {room.description || "No description provided for this room."}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                      #{room.language.toLowerCase()}
                    </span>
                    {room.type === "private" && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-xs font-semibold rounded-md flex items-center gap-1">
                        <Key className="w-3 h-3" /> Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {room.memberCount} members
                    </span>
                    <button
                      onClick={buttonAction.action}
                      className="text-primary font-bold text-sm hover:underline hover:text-primary/80 transition-colors"
                    >
                      {buttonAction.text === "Join" ? "Join Now" : buttonAction.text}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {uniqueRooms.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No rooms found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              We couldn't find any rooms matching your current filter. Try a different category or create your own!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 font-semibold text-primary hover:underline hover:text-primary/80"
            >
              Create a new room
            </button>
          </div>
        )}

        {/* Load More Mock */}
        {uniqueRooms.length > 0 && (
          <div className="mt-16 flex justify-center pb-12">
            <button className="flex items-center gap-2 px-8 py-3 border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-50 transition-colors shadow-sm">
              Load More Rooms
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={onJoinRoom}
        />
      )}
      
      {showPrivateRoomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Join Private Room</h3>
            <p className="text-slate-500 mb-6">This room is password protected. Please enter the unique access code to join.</p>
            
            <div className="space-y-4">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase tracking-widest font-mono"
                />
              </div>
              
              <div className="flex flex-col gap-3 pt-2">
                <button 
                  onClick={() => {
                    handleJoinPrivateRoom(joinCode);
                    setShowPrivateRoomModal(false);
                  }} 
                  disabled={!joinCode.trim()}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  Confirm & Join
                </button>
                <button 
                  onClick={() => setShowPrivateRoomModal(false)} 
                  className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
