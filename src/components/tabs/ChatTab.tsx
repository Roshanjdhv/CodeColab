import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { 
  Search, 
  Edit3, 
  UserPlus, 
  MessageSquare, 
  PlusCircle, 
  Image, 
  FileText, 
  Code, 
  Plus,
  Send,
  MoreVertical,
  X,
  MessageCircle
} from "lucide-react";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectFriend = (friend: any) => {
    setSelectedFriend(friend);
    if (friend.unreadCount > 0) {
      markAsRead({ fromUserId: friend.friendId });
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
    <div className="flex flex-col h-[700px] bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden font-display">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Friends List */}
        <aside className="w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
          <div className="p-6 flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-slate-900 text-xl font-bold">Messages</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                  {friends?.filter(f => f.status === 'online' || f.status === 'coding').length || 0} online
                </p>
              </div>
              <button className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95">
                <Edit3 className="w-5 h-5" />
              </button>
            </div>

            {/* Search Friends */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1 overflow-y-auto pr-2 no-scrollbar">
              {friends?.map((friend) => (
                <button
                  key={friend.friendId}
                  onClick={() => handleSelectFriend(friend)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer group relative border ${
                    selectedFriend?.friendId === friend.friendId 
                      ? "bg-white border-indigo-200 shadow-sm" 
                      : "hover:bg-white border-transparent"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="size-11 rounded-full bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
                      {friend.profileImageUrl ? (
                        <img src={friend.profileImageUrl} alt={friend.username} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: friend.userColor || "#6366f1" }}>
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${
                       friend.status === "online" ? "bg-emerald-500" :
                       friend.status === "coding" ? "bg-blue-500" : "bg-slate-300"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <p className={`text-sm font-bold truncate ${
                        selectedFriend?.friendId === friend.friendId ? "text-indigo-600" : "text-slate-900"
                      }`}>
                        {friend.username}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {friend.lastMessage?.timestamp ? new Date(friend.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs truncate leading-tight">
                      {friend.lastMessage ? (
                        <>
                          {friend.lastMessage.fromMe && <span className="text-slate-400 mr-1">You:</span>}
                          {friend.lastMessage.content}
                        </>
                      ) : "Start a conversation"}
                    </p>
                  </div>
                  {friend.unreadCount > 0 && (
                    <div className="absolute right-2 top-11 size-5 bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold rounded-full border-2 border-white shadow-sm">
                      {friend.unreadCount}
                    </div>
                  )}
                </button>
              ))}

              {friends?.length === 0 && (
                <div className="py-10 text-center flex flex-col items-center">
                  <div className="size-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                     <UserPlus className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 mb-1">No friends yet</p>
                  <p className="text-xs text-slate-500 px-4">Connect with developers in the public tab to start chatting.</p>
                </div>
              )}
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200 hover:border-indigo-200 transition-all active:scale-95 group shadow-sm">
                <UserPlus className="w-4 h-4 group-hover:text-indigo-600 transition-colors" />
                <span>Find More Friends</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <section className="flex-1 flex flex-col bg-slate-50/30 relative overflow-hidden">
          {selectedFriend ? (
            <>
              {/* Chat Header */}
              <header className="flex items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-4 z-10 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="relative shrink-0">
                      <div className="size-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                        {selectedFriend.profileImageUrl ? (
                          <img src={selectedFriend.profileImageUrl} alt={selectedFriend.username} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: selectedFriend.userColor || "#6366f1" }}>
                            {selectedFriend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-white ${
                        selectedFriend.status === "online" ? "bg-green-500" :
                        selectedFriend.status === "coding" ? "bg-blue-500" : "bg-slate-300"
                      }`} />
                   </div>
                   <div>
                     <h3 className="text-slate-900 font-bold leading-none mb-1">{selectedFriend.username}</h3>
                     <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                       {selectedFriend.status === "coding" ? "🧑‍💻 Currently Coding" : selectedFriend.status || "offline"}
                     </p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
                      <Search className="w-5 h-5" />
                   </button>
                   <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all">
                      <MoreVertical className="w-5 h-5" />
                   </button>
                </div>
              </header>

              {/* Messages Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col no-scrollbar">
                {messages?.map((message, idx) => {
                  const isMe = message.fromUserId !== selectedFriend.friendId;
                  
                  return (
                    <div key={message._id} className={`flex ${isMe ? "justify-end" : "justify-start"} items-end gap-3 max-w-[85%] ${isMe ? "ml-auto" : "mr-auto"}`}>
                      {!isMe && (
                        <div className="size-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          {selectedFriend.profileImageUrl ? (
                            <img src={selectedFriend.profileImageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: selectedFriend.userColor || "#6366f1" }}>
                              {selectedFriend.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} gap-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all hover:shadow-md ${
                          isMe 
                            ? "bg-indigo-600 text-white rounded-br-none" 
                            : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                        }`}>
                          {message.content}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold px-1">
                          {new Date(message._creationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />

                {messages?.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-50">
                    <div className="size-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200">
                       <MessageCircle className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No messages yet</p>
                    <p className="text-xs text-slate-500">Break the ice and send a hello!</p>
                  </div>
                )}
              </div>

              {/* Messaging Input Area */}
              <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto">
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-slate-50">
                      <PlusCircle className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-all rounded-lg hover:bg-slate-50">
                      <Image className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 relative group">
                    <input 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 shadow-sm" 
                      placeholder={`Message ${selectedFriend.username}...`}
                      autoFocus
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                      <FileText className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600" />
                      <Code className="w-4 h-4 text-slate-400 cursor-pointer hover:text-indigo-600" />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/30">
              <div className="w-full max-w-md flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="relative mb-10">
                  <div className="size-24 bg-indigo-50 rounded-3xl rotate-12 flex items-center justify-center border border-indigo-100 shadow-sm">
                    <div className="size-20 bg-indigo-100/50 rounded-2xl -rotate-12 flex items-center justify-center backdrop-blur-sm border border-indigo-200 shadow-sm">
                      <MessageSquare className="w-10 h-10 text-indigo-600 rotate-0" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-10 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <h2 className="text-slate-900 text-2xl font-bold mb-3 tracking-tight">Your Inbox</h2>
                <p className="text-slate-500 text-base leading-relaxed mb-10">
                  Choose a friend from the sidebar or search for a teammate to start collaborating on code and sharing ideas.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                    Start a New Chat
                  </button>
                  <button className="px-8 py-3 bg-white text-slate-500 font-bold rounded-xl border border-slate-200 hover:border-indigo-400/50 transition-all active:scale-95 shadow-sm">
                    Recent Activity
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
