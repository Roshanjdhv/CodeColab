import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { CreateRoomModal } from "../modals/CreateRoomModal";

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Explore Rooms</h2>
          <p className="text-gray-600">Join coding rooms and collaborate with others</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all"
        >
          Create Room
        </button>
      </div>

      {/* Join by Code */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-2">Join Private Room</h3>
        <form onSubmit={handleJoinByCode} className="flex gap-2">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter room code"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Join
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex space-x-2">
        {[
          { id: "all", label: `All Rooms (${allRooms?.length || 0})` },
          { id: "public", label: `Public (${publicRooms?.length || 0})` },
          { id: "my", label: `My Rooms (${myRooms?.length || 0})` },
          { id: "joined", label: `Joined Rooms (${joinedRooms?.length || 0})` },
        ].map((filterOption) => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === filterOption.id
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueRooms.map((room) => (
          <div
            key={room._id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 truncate">{room.name}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                room.type === "public" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-blue-100 text-blue-800"
              }`}>
                {room.type}
              </span>
            </div>
            
            {room.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{room.description}</p>
            )}
            
            <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
              <span>By {room.creatorName}</span>
              <span>{room.memberCount} members</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                {room.language}
              </span>
              {(() => {
                const buttonAction = getButtonAction(room);
                return (
                  <button
                    onClick={buttonAction.action}
                    className={`${buttonAction.className} text-white px-3 py-1 rounded text-sm transition-colors`}
                  >
                    {buttonAction.text}
                  </button>
                );
              })()}
            </div>
          </div>
        ))}
      </div>

      {uniqueRooms.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏠</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">Create a new room to start coding with others!</p>
        </div>
      )}

      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={onJoinRoom}
        />
      )}
      
      {showPrivateRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Join Private Room</h3>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter room code"
              className="w-full px-3 py-2 border rounded mb-4"
            />
            <div className="flex space-x-3">
              <button onClick={() => setShowPrivateRoomModal(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={() => {
                handleJoinPrivateRoom(joinCode);
                setShowPrivateRoomModal(false);
              }} className="px-4 py-2 bg-blue-600 text-white rounded">Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
