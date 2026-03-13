import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  Search, 
  UserPlus, 
  UserCheck, 
  Clock, 
  ChevronDown, 
  Terminal,
  Users,
  MessageSquare,
  X
} from "lucide-react";

export function PublicTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);

  const publicUsers = useQuery(api.friends.getPublicUsers, { 
    search: searchQuery || undefined,
    limit: 20 
  });
  const sendFriendRequest = useMutation(api.friends.sendFriendRequest);

  const handleSendRequest = async () => {
    if (!selectedUser) return;

    try {
      await sendFriendRequest({
        toUserId: selectedUser.userId as Id<"users">,
        message: requestMessage.trim() || undefined,
      });
      
      toast.success(`Friend request sent to ${selectedUser.username}!`);
      setShowRequestModal(false);
      setSelectedUser(null);
      setRequestMessage("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send friend request");
    }
  };

  const openRequestModal = (user: any) => {
    setSelectedUser(user);
    setShowRequestModal(true);
  };

  return (
    <div className="flex flex-col min-h-full font-display">
      {/* Search and Filters Section */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900">Discover Developers</h1>
          <p className="text-slate-500">Find and connect with developers across the globe.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-1 h-12">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm bg-white border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all group">
              <div className="text-slate-400 flex items-center justify-center pl-4 group-focus-within:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                className="w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 px-4 text-base font-normal placeholder:text-slate-400 text-slate-900" 
                placeholder="Search by name, role, or tech stack..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary text-white px-6 font-medium shadow-md shadow-primary/20 active:scale-95 transition-all">
              <span>All</span>
            </button>
            <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 font-medium hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
              <span>Frontend</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
            <button className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-6 font-medium hover:bg-slate-50 transition-colors shadow-sm active:scale-95">
              <span>Backend</span>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </button>
          </div>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {publicUsers?.map((user) => (
          <div
            key={user.userId}
            className="group flex flex-col rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-primary/30 transition-all duration-300"
          >
            {/* Cover Gradient/Image */}
            <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40 relative">
               <div className="absolute inset-0 opacity-20 group-hover:scale-110 transition-transform duration-700 overflow-hidden">
                  <div className={`w-full h-full bg-gradient-to-br transition-all ${
                    user.userColor ? `from-[${user.userColor}]/40 to-white/10` : 'from-primary/40 to-indigo-600/20'
                  }`} />
               </div>
              <div className="absolute -bottom-10 left-6 z-10">
                <div className="relative size-20 rounded-2xl border-4 border-white overflow-hidden bg-slate-200 shadow-sm flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: user.userColor || "#6B7280" }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={`absolute bottom-1 right-1 size-4 rounded-full border-2 border-white shadow-sm ${
                    user.status === "online" ? "bg-green-500" :
                    user.status === "coding" ? "bg-blue-500" : "bg-slate-400"
                  }`} 
                  title={user.status || "offline"} />
                </div>
              </div>
            </div>

            <div className="pt-12 p-6 flex flex-col gap-4 flex-1">
              <div className="flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">
                  {user.username}
                </h3>
                <p className="text-sm font-medium text-primary">
                  {user.status === "coding" ? "🧑‍💻 Currently Coding" : "Developer"}
                </p>
              </div>
              <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed flex-1">
                {user.bio || "No bio description available. Check back later to learn more about this developer!"}
              </p>
              
              <div className="flex flex-wrap gap-2 py-2">
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Full-stack</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded font-medium">Node.js</span>
              </div>

              <div className="mt-2">
                {user.isFriend ? (
                  <div className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-green-50 text-green-700 text-sm font-bold border border-green-200">
                    <UserCheck className="w-5 h-5" />
                    <span>Friends</span>
                  </div>
                ) : user.hasPendingRequest ? (
                  <div className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold border border-amber-200">
                    <Clock className="w-5 h-5" />
                    <span>{user.requestSentByMe ? "Request Sent" : "Respond to Invitation"}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => openRequestModal(user)}
                    className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Friend</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {publicUsers?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Users className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {searchQuery ? "No users found" : "No developers active"}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {searchQuery 
              ? "We couldn't find anyone matching your search terms. Try keywords like 'React', 'Design', or just 'Alex'." 
              : "Looks like you're the first one here! Your profile is public, so others will see you soon."
            }
          </p>
        </div>
      )}

      {/* Friend Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start mb-6">
               <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-primary" />
               </div>
               <button onClick={() => setShowRequestModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
               </button>
            </div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Connect with {selectedUser.username}
            </h3>
            <p className="text-slate-500 mb-6">Send a friendly invitation to start collaborating on projects together.</p>
            
            <div className="flex items-center space-x-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="relative size-12 rounded-xl border-2 border-white overflow-hidden shadow-sm">
                {selectedUser.profileImageUrl ? (
                  <img
                    src={selectedUser.profileImageUrl}
                    alt={selectedUser.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: selectedUser.userColor || "#6B7280" }}
                  >
                    {selectedUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-slate-900">{selectedUser.username}</p>
                <p className="text-sm text-slate-500 truncate max-w-[200px]">{selectedUser.bio || "Developer"}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Personal Message (optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hey! I'd love to collaborate on some React projects with you."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-slate-900"
                rows={4}
                maxLength={200}
              />
              <div className="flex justify-end mt-1">
                <span className="text-xs text-slate-400 font-medium">
                  {requestMessage.length}/200
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSendRequest}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                Send Invitation
              </button>
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedUser(null);
                  setRequestMessage("");
                }}
                className="w-full py-3 text-slate-500 font-semibold hover:text-slate-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
