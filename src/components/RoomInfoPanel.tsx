import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface RoomInfoPanelProps {
  roomInfo: any;
  onClose: () => void;
}

export function RoomInfoPanel({ roomInfo, onClose }: RoomInfoPanelProps) {
  const removeUser = useMutation(api.rooms.removeUserFromRoom);
  const promoteToAdmin = useMutation(api.rooms.promoteToAdmin);
  const demoteFromAdmin = useMutation(api.rooms.demoteFromAdmin);

  const handleRemoveUser = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this user from the room?")) return;
    
    try {
      await removeUser({ 
        roomId: roomInfo._id as Id<"rooms">, 
        userId: userId as Id<"users"> 
      });
      toast.success("User removed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove user");
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      await promoteToAdmin({ 
        roomId: roomInfo._id as Id<"rooms">, 
        userId: userId as Id<"users"> 
      });
      toast.success("User promoted to admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to promote user");
    }
  };

  const handleDemoteUser = async (userId: string) => {
    try {
      await demoteFromAdmin({ 
        roomId: roomInfo._id as Id<"rooms">, 
        userId: userId as Id<"users"> 
      });
      toast.success("User demoted from admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to demote user");
    }
  };

  const getRoleIcon = (member: any) => {
    if (member.isOwner) return "👑";
    if (member.isAdmin) return "⭐";
    return "👤";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-500";
      case "coding": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="h-full bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold">Room Information</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Room Details */}
      <div className="p-4 border-b border-gray-700">
        <h4 className="font-medium mb-2">{roomInfo.name}</h4>
        {roomInfo.description && (
          <p className="text-gray-400 text-sm mb-2">{roomInfo.description}</p>
        )}
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span className={`px-2 py-1 rounded text-xs ${
            roomInfo.type === "public" ? "bg-green-600" : "bg-blue-600"
          }`}>
            {roomInfo.type}
          </span>
          <span>{roomInfo.language}</span>
          <span>{roomInfo.memberCount} members</span>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h4 className="font-medium mb-3">Members ({roomInfo.memberCount})</h4>
          <div className="space-y-3">
            {roomInfo.members.map((member: any) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {/* User Avatar */}
                  <div className="relative">
                    {member.profileImageUrl ? (
                      <img
                        src={member.profileImageUrl}
                        alt={member.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: member.userColor }}
                      >
                        {member.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-700 ${getStatusColor(member.status)}`} />
                  </div>

                  {/* User Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{member.username}</span>
                      <span className="text-lg">{getRoleIcon(member)}</span>
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {member.isOwner ? "Owner" : member.isAdmin ? "Admin" : "Member"} • {member.status}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {roomInfo.currentUserRole.isOwner && !member.isOwner && (
                  <div className="flex items-center space-x-1">
                    {!member.isAdmin ? (
                      <button
                        onClick={() => handlePromoteUser(member.userId)}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                        title="Promote to Admin"
                      >
                        ⭐
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDemoteUser(member.userId)}
                        className="text-xs bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700 transition-colors"
                        title="Demote from Admin"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveUser(member.userId)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                      title="Remove User"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {(roomInfo.currentUserRole.isAdmin && !roomInfo.currentUserRole.isOwner && !member.isOwner && !member.isAdmin) && (
                  <button
                    onClick={() => handleRemoveUser(member.userId)}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                    title="Remove User"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Stats */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          <div>Created by {roomInfo.creatorName}</div>
          <div>Room ID: {roomInfo._id.slice(-8)}</div>
          {roomInfo.uniqueCode && (
            <div>Join Code: {roomInfo.uniqueCode}</div>
          )}
        </div>
      </div>
    </div>
  );
}
