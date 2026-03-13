import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  Info, 
  Users, 
  Crown, 
  ShieldAlert, 
  X, 
  MoreVertical, 
  Globe, 
  Lock,
  Calendar,
  Code,
  Star,
  Settings,
  Trash2,
  UserMinus,
  ArrowUpCircle,
  ArrowDownCircle
} from "lucide-react";

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
    if (member.isOwner) return <Crown className="w-3.5 h-3.5 text-amber-500" />;
    if (member.isAdmin) return <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />;
    return <Users className="w-3.5 h-3.5 text-slate-500" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
      case "coding": return "bg-primary shadow-[0_0_8px_rgba(80,72,229,0.5)]";
      default: return "bg-slate-500";
    }
  };

  return (
    <div className="h-full bg-[#121121] text-slate-300 flex flex-col font-display border-l border-white/5 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#121121]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold tracking-tight">Room Information</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Details & Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Room Details */}
      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-white tracking-tight">{roomInfo.name}</h4>
          {roomInfo.description && (
            <p className="text-slate-400 text-sm leading-relaxed">{roomInfo.description}</p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
            roomInfo.type === "public" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
              : "bg-primary/10 text-primary border-primary/20"
          }`}>
            {roomInfo.type === "public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            <span>{roomInfo.type}</span>
          </div>
          <div className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-wider">
            {roomInfo.language}
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <Users className="w-3.5 h-3.5" />
               <span>Presence ({roomInfo.memberCount})</span>
            </h4>
          </div>
          
          <div className="space-y-2">
            {roomInfo.members.map((member: any) => (
              <div
                key={member.userId}
                className="group flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="relative shrink-0">
                    <div className="size-10 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10">
                      {member.profileImageUrl ? (
                        <img
                          src={member.profileImageUrl}
                          alt={member.username}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: member.userColor }}
                        >
                          {member.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Status Indicator */}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#121121] ${getStatusColor(member.status)}`} />
                  </div>

                  {/* User Info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-slate-200 truncate">{member.username}</span>
                      {getRoleIcon(member)}
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                       {member.isOwner ? "Founder" : member.isAdmin ? "Supervisor" : "Developer"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {roomInfo.currentUserRole.isOwner && !member.isOwner && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => !member.isAdmin ? handlePromoteUser(member.userId) : handleDemoteUser(member.userId)}
                      className={`p-1.5 rounded-lg transition-all ${
                        !member.isAdmin 
                          ? "bg-primary/10 text-primary hover:bg-primary hover:text-white" 
                          : "bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white"
                      }`}
                      title={!member.isAdmin ? "Promote to Admin" : "Demote from Admin"}
                    >
                      {!member.isAdmin ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleRemoveUser(member.userId)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                      title="Remove User"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(roomInfo.currentUserRole.isAdmin && !roomInfo.currentUserRole.isOwner && !member.isOwner && !member.isAdmin) && (
                  <button
                    onClick={() => handleRemoveUser(member.userId)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                    title="Remove User"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Room Stats Footer */}
      <div className="p-6 border-t border-white/5 bg-[#0a0a14]/50">
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
             <span>Founder</span>
             <span className="text-slate-200">{roomInfo.creatorName}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
             <span>Identifier</span>
             <span className="text-slate-200 font-mono tracking-normal">{roomInfo._id.slice(-8)}</span>
          </div>
          {roomInfo.uniqueCode && (
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
               <span>Access Code</span>
               <span className="text-amber-500">{roomInfo.uniqueCode}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
