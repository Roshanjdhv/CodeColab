import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Discover Users</h2>
        <p className="text-gray-600">Find and connect with other developers</p>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400">🔍</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name or bio..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {publicUsers?.map((user) => (
          <div
            key={user.userId}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-3">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: user.userColor || "#6B7280" }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {user.username}
                  </h3>
                  <span className={`w-2 h-2 rounded-full ${
                    user.status === "online" ? "bg-green-500" :
                    user.status === "coding" ? "bg-blue-500" : "bg-gray-400"
                  }`} />
                </div>
                
                {user.bio && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                <div className="mt-3">
                  {user.isFriend ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Friends
                    </span>
                  ) : user.hasPendingRequest ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {user.requestSentByMe ? "Request Sent" : "Request Received"}
                    </span>
                  ) : (
                    <button
                      onClick={() => openRequestModal(user)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Add Friend
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {publicUsers?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No users found" : "No public users"}
          </h3>
          <p className="text-gray-600">
            {searchQuery 
              ? "Try adjusting your search terms" 
              : "Be the first to make your profile public!"
            }
          </p>
        </div>
      )}

      {/* Friend Request Modal */}
      {showRequestModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Send Friend Request
            </h3>
            
            <div className="flex items-center space-x-3 mb-4">
              {selectedUser.profileImageUrl ? (
                <img
                  src={selectedUser.profileImageUrl}
                  alt={selectedUser.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: selectedUser.userColor || "#6B7280" }}
                >
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{selectedUser.username}</p>
                {selectedUser.bio && (
                  <p className="text-sm text-gray-600">{selectedUser.bio}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Hi! I'd like to connect with you on CodeCollab."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {requestMessage.length}/200 characters
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRequestModal(false);
                  setSelectedUser(null);
                  setRequestMessage("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
