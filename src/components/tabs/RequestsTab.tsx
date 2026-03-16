import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  Bell, 
  UserPlus, 
  DoorOpen, 
  BellOff, 
  ClipboardList, 
  Share2, 
  Search, 
  Info,
  Check,
  X,
  Mail,
  User,
  Users,
  ChevronRight
} from "lucide-react";

export function RequestsTab() {
  const joinRequests = useQuery(api.rooms.getJoinRequests);
  const friendRequests = useQuery(api.friends.getFriendRequests);
  const handleJoinRequest = useMutation(api.rooms.handleJoinRequest);
  const handleFriendRequest = useMutation(api.friends.handleFriendRequest);

  const handleRoomRequest = async (requestId: string, action: "approve" | "deny") => {
    try {
      await handleJoinRequest({
        requestId: requestId as Id<"joinRequests">,
        action,
      });
      toast.success(`Room request ${action}d successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} request`);
    }
  };

  const handleFriendRequestAction = async (requestId: string, action: "accept" | "decline") => {
    try {
      await handleFriendRequest({
        requestId: requestId as Id<"friendRequests">,
        action,
      });
      toast.success(`Friend request ${action}ed successfully`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${action} request`);
    }
  };

  const totalRequests = (joinRequests?.length || 0) + (friendRequests?.length || 0);

  return (
    <div className="flex flex-col min-h-full font-display">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-4 bg-card rounded-t-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <Bell className="w-5 h-5 shadow-sm" />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-tight text-foreground">Requests</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors border border-border">
            <Users className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col bg-card shadow-sm rounded-b-xl overflow-hidden min-h-[600px]">
        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-border">
          <div className="flex gap-8">
            <button className="flex flex-col items-center justify-center border-b-2 border-primary text-primary pb-3 pt-2">
              <p className="text-sm font-bold">Pending ({totalRequests})</p>
            </button>
            <button className="flex flex-col items-center justify-center border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-3 pt-2">
              <p className="text-sm font-bold">History</p>
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="flex-1 p-6 space-y-8">
          {/* Friend Requests */}
          {friendRequests && friendRequests.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4" /> friend invitations
              </h3>
              <div className="grid gap-3">
                {friendRequests.map((request) => (
                  <div key={request._id} className="group p-4 bg-muted/30 rounded-2xl border border-border hover:border-primary/20 hover:bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative size-12 rounded-xl border-2 border-card overflow-hidden shadow-sm bg-muted">
                          {request.fromProfileImageUrl ? (
                            <img src={request.fromProfileImageUrl} alt={request.fromUsername} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: "#5048e5" }}>
                              {request.fromUsername.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{request.fromUsername}</p>
                          <p className="text-xs text-muted-foreground">{new Date(request._creationTime).toLocaleDateString()}</p>
                          {request.message && (
                            <p className="text-sm text-muted-foreground mt-1 italic line-clamp-1 border-l-2 border-primary/20 pl-2">
                              "{request.message}"
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleFriendRequestAction(request._id, "decline")}
                          className="p-2.5 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/20 rounded-xl transition-all active:scale-95 shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleFriendRequestAction(request._id, "accept")}
                          className="p-2.5 bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 px-4"
                        >
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-bold hidden sm:inline">Accept</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Room Requests */}
          {joinRequests && joinRequests.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <DoorOpen className="w-4 h-4" /> room access requests
              </h3>
              <div className="grid gap-3">
                {joinRequests.map((request) => (
                  <div key={request._id} className="group p-4 bg-muted/30 rounded-2xl border border-border hover:border-emerald-200 hover:bg-card hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <DoorOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{request.requesterName}</p>
                          <p className="text-sm text-muted-foreground">
                            Wants to join <span className="font-bold text-primary">{request.roomName}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRoomRequest(request._id, "deny")}
                          className="p-2.5 bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/20 rounded-xl transition-all shadow-sm"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleRoomRequest(request._id, "approve")}
                          className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all flex items-center gap-2 px-4 font-bold text-sm"
                        >
                          <Check className="w-5 h-5" />
                          <span className="hidden sm:inline">Approve</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalRequests === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative mb-8">
                <div className="w-64 h-64 relative flex items-center justify-center rounded-full bg-primary/5">
                  <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse opacity-20"></div>
                  <div className="z-10 bg-card p-8 rounded-2xl shadow-xl border border-border">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <UserPlus className="w-6 h-6 text-primary" />
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <DoorOpen className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <BellOff className="w-6 h-6 text-indigo-500" />
                      </div>
                      <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-2 h-12 w-12 rounded-full bg-primary/10 blur-xl"></div>
                  <div className="absolute -bottom-4 -left-2 h-16 w-16 rounded-full bg-indigo-500/10 blur-xl"></div>
                </div>
              </div>
              <div className="max-w-[420px] space-y-3">
                <h3 className="text-2xl font-bold text-foreground tracking-tight">Everything is up to date</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  When people ask to join your rooms or send you friend invitations, they'll appear here for your review.
                </p>
              </div>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 min-w-[160px] active:scale-95">
                  <Share2 className="w-5 h-5" />
                  <span>Invite Friends</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-bold hover:bg-muted/80 transition-all min-w-[160px] active:scale-95 border border-border">
                  <Search className="w-5 h-5" />
                  <span>Find Rooms</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-muted/50 border-t border-border text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 font-medium">
            <Info className="w-4 h-4" />
            You can manage your notification preferences in settings.
          </p>
        </div>
      </div>
    </div>
  );
}
