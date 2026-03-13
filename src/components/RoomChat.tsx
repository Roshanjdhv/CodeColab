import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { 
  Send, 
  Paperclip, 
  MessageSquare, 
  Sparkles, 
  BrainCircuit, 
  User, 
  Clock,
  ChevronDown
} from "lucide-react";

interface RoomChatProps {
  roomId: string;
}

export function RoomChat({ roomId }: RoomChatProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const messages = useQuery(api.messages.getRoomMessages, { roomId: roomId as Id<"rooms"> });
  const sendMessage = useMutation(api.messages.sendMessage);
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage({
        roomId: roomId as Id<"rooms">,
        content: message.trim(),
        type: "text",
      });
      setMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) throw new Error("Upload failed");

      const { storageId } = await result.json();
      await sendMessage({
        roomId: roomId as Id<"rooms">,
        content: file.name,
        type: "file",
        fileId: storageId,
      });
      toast.success("File uploaded!");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#121121] font-display">
      {/* Chat Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#121121]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white text-sm font-bold tracking-tight">Collaboration</h3>
            <div className="flex items-center gap-1.5">
               <div className="size-1 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{messages?.length || 0} sync points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
        {messages?.map((msg) => {
          const isAI = msg.authorName === "CodeMentor";
          
          return (
            <div key={msg._id} className={`flex flex-col gap-2 ${isAI ? "animate-in slide-in-from-left-2 duration-500" : ""}`}>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className={`size-6 rounded-lg overflow-hidden flex items-center justify-center ${isAI ? "bg-purple-500 text-white" : "bg-white/5"}`}>
                    {msg.authorImage ? (
                      <img src={msg.authorImage} alt={msg.authorName} className="w-full h-full object-cover" />
                    ) : isAI ? (
                       <Sparkles className="w-3.5 h-3.5" />
                    ) : (
                      <div 
                        className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: msg.authorColor || "#5048e5" }}
                      >
                        {msg.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isAI ? "text-purple-400" : "text-slate-400"}`}>
                    {msg.authorName} {isAI && <span className="ml-1 px-1.5 py-0.5 bg-purple-500/10 rounded text-[8px] border border-purple-500/20">AI Assistant</span>}
                  </span>
                </div>
                <span className="text-[9px] text-slate-600 font-bold tabular-nums">{formatTime(msg._creationTime)}</span>
              </div>
              
              <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed group transition-all duration-300 ${
                isAI 
                  ? "bg-purple-500/5 border border-purple-500/10 text-slate-200 shadow-[0_4px_20px_rgba(168,85,247,0.05)]" 
                  : "bg-white/5 border border-white/5 text-slate-300 hover:bg-white/[0.07] hover:border-white/10"
              }`}>
                {msg.type === "file" && msg.fileUrl ? (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 bg-black/20 rounded-xl hover:bg-black/30 transition-all border border-white/5 group-hover:border-primary/30"
                  >
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                      <Paperclip className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                       <span className="text-xs font-bold text-slate-200 truncate">{msg.content}</span>
                       <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Shared Asset</span>
                    </div>
                  </a>
                ) : msg.type === "code" ? (
                  <div className="bg-[#0f0e1b] rounded-xl p-4 font-mono text-[11px] overflow-x-auto border border-white/5 shadow-inner">
                    <pre className="text-emerald-400/90">{msg.content}</pre>
                  </div>
                ) : (
                  <div className="break-words font-medium">
                    {msg.content}
                  </div>
                )}
                
                {/* Decorative glow for AI messages */}
                {isAI && (
                  <div className="absolute -inset-px bg-gradient-to-r from-purple-500/10 to-transparent rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-5 border-t border-white/5 bg-[#121121]/80 backdrop-blur-xl">
        <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
          <div className="relative group">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Collaborate with team..."
              className="w-full pl-5 pr-12 py-3.5 bg-white/5 text-slate-100 rounded-2xl border border-white/5 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-slate-600 text-sm font-medium shadow-inner"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
               <label className="p-2 text-slate-500 hover:text-primary hover:bg-white/5 rounded-xl transition-all cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                {isUploading ? <div className="animate-spin rounded-full size-4 border-2 border-primary border-t-transparent" /> : <Paperclip className="w-4 h-4" />}
              </label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale group"
          >
            <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span>Broadcast Message</span>
          </button>
        </form>
      </div>
    </div>
  );
}
