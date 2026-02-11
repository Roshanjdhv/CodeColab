import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Requests</h2>
        <p className="text-gray-600">
          Manage room join requests and friend requests ({totalRequests} pending)
        </p>
      </div>

      {/* Friend Requests Section */}
      {friendRequests && friendRequests.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👥</span>
            Friend Requests ({friendRequests.length})
          </h3>
          
          <div className="space-y-3">
            {friendRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {request.fromProfileImageUrl ? (
                      <img
                        src={request.fromProfileImageUrl}
                        alt={request.fromUsername}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {request.fromUsername.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div>
                      <p className="font-medium text-gray-900">
                        {request.fromUsername}
                      </p>
                      {request.fromBio && (
                        <p className="text-sm text-gray-600">{request.fromBio}</p>
                      )}
                      {request.message && (
                        <p className="text-sm text-gray-700 mt-1 italic">
                          "{request.message}"
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request._creationTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFriendRequestAction(request._id, "decline")}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleFriendRequestAction(request._id, "accept")}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Join Requests Section */}
      {joinRequests && joinRequests.length > 0 && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🏠</span>
            Room Join Requests ({joinRequests.length})
          </h3>
          
          <div className="space-y-3">
            {joinRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg p-4 border border-green-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {request.requesterName}
                    </p>
                    <p className="text-sm text-gray-600">
                      wants to join <span className="font-medium">{request.roomName}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(request._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRoomRequest(request._id, "deny")}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => handleRoomRequest(request._id, "approve")}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
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
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📨</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">
            Room join requests and friend requests will appear here
          </p>
        </div>
      )}
    </div>
  );
}
