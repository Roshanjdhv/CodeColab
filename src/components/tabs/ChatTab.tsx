import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function ChatTab() {
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messageText, setMessageText] = useState("");

  const friends = useQuery(api.friends.getFriends);
  const messages = useQuery(
    api.friends.getPrivateMessages,
    selectedFriend ? { friendId: selectedFriend.friendId } : "skip"
  );
  const sendMessage = useMutation(api.friends.sendPrivateMessage);
  const markAsRead = useMutation(api.friends.markMessagesAsRead);

  const handleSelectFriend = async (friend: any) => {
    setSelectedFriend(friend);
    
    // Mark messages as read
    if (friend.unreadCount > 0) {
      try {
        await markAsRead({ fromUserId: friend.friendId });
      } catch (error) {
        console.error("Failed to mark messages as read:", error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedFriend) return;

    try {
      await sendMessage({
        toUserId: selectedFriend.friendId as Id<"users">,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Private Messages</h2>
        <p className="text-gray-600">Chat with your friends</p>
      </div>

      <div className="flex h-96 bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Friends List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Friends</h3>
          </div>
          
          <div className="overflow-y-auto h-full">
            {friends?.map((friend) => (
              <button
                key={friend.friendId}
                onClick={() => handleSelectFriend(friend)}
                className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-100 transition-colors ${
                  selectedFriend?.friendId === friend.friendId ? "bg-blue-50 border-blue-200" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  {friend.profileImageUrl ? (
                    <img
                      src={friend.profileImageUrl}
                      alt={friend.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                      {friend.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 truncate">
                        {friend.username}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className={`w-2 h-2 rounded-full ${
                          friend.status === "online" ? "bg-green-500" :
                          friend.status === "coding" ? "bg-blue-500" : "bg-gray-400"
                        }`} />
                        {friend.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {friend.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {friend.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {friend.lastMessage.fromMe ? "You: " : ""}
                        {friend.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            
            {friends?.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No friends yet</p>
                <p className="text-xs mt-1">Add friends from the Public tab</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  {selectedFriend.profileImageUrl ? (
                    <img
                      src={selectedFriend.profileImageUrl}
                      alt={selectedFriend.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                      {selectedFriend.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{selectedFriend.username}</p>
                    <p className="text-xs text-gray-500 capitalize">{selectedFriend.status}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages?.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.fromUserId === selectedFriend.friendId ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.fromUserId === selectedFriend.friendId
                          ? "bg-gray-200 text-gray-900"
                          : "bg-blue-600 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.fromUserId === selectedFriend.friendId ? "text-gray-500" : "text-blue-100"
                      }`}>
                        {new Date(message._creationTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {messages?.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet</p>
                    <p className="text-sm mt-1">Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <p>Select a friend to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
