import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

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
    <div className="h-full flex flex-col bg-gray-800">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-white font-semibold">Room Chat</h3>
        <p className="text-gray-400 text-sm">{messages?.length || 0} messages</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg) => (
          <div key={msg._id} className="flex space-x-3">
            {msg.authorImage ? (
              <img
                src={msg.authorImage}
                alt={msg.authorName}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
            ) : (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: msg.authorColor || "#666666" }}
              >
                {msg.authorName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-white font-medium text-sm">{msg.authorName}</span>
                <span className="text-gray-400 text-xs">
                  {formatTime(msg._creationTime)}
                </span>
              </div>
              <div className="text-gray-300 text-sm break-words">
                {msg.type === "file" && msg.fileUrl ? (
                  <a
                    href={msg.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center space-x-1"
                  >
                    <span>📎</span>
                    <span>{msg.content}</span>
                  </a>
                ) : msg.type === "code" ? (
                  <div className="bg-gray-900 rounded p-2 font-mono text-xs overflow-x-auto">
                    <pre>{msg.content}</pre>
                  </div>
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          <label className="bg-gray-600 text-white px-3 py-2 rounded cursor-pointer hover:bg-gray-500 transition-colors">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            {isUploading ? "⏳" : "📎"}
          </label>
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
