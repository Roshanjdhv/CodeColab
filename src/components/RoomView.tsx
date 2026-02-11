import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CodeEditor } from "./CodeEditor";
import { RoomChat } from "./RoomChat";
import { FileExplorer } from "./FileExplorer";
import { ExecutionPanel } from "./ExecutionPanel";
import { RoomInfoPanel } from "./RoomInfoPanel";

interface RoomViewProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomView({ roomId, onLeave }: RoomViewProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  
  const roomInfo = useQuery(api.rooms.getRoomInfo, { roomId: roomId as Id<"rooms"> });
  const files = useQuery(api.files.getRoomFiles, { roomId: roomId as Id<"rooms"> });
  const activeFile = useQuery(api.files.getFile, 
    activeFileId ? { fileId: activeFileId as Id<"files"> } : "skip"
  );

  useEffect(() => {
    if (files && files.length > 0 && !activeFileId) {
      setActiveFileId(files[0]._id);
    }
  }, [files, activeFileId]);

  if (!roomInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Room not found</h2>
          <button
            onClick={onLeave}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={onLeave}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-white font-semibold">{roomInfo.name}</h1>
            <p className="text-gray-400 text-sm">
              {roomInfo.language} • {roomInfo.memberCount} members
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Active Users Indicator */}
          <div className="flex items-center space-x-1">
            {roomInfo.members.slice(0, 5).map((member) => (
              <div
                key={member.userId}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-gray-600"
                style={{ backgroundColor: member.userColor }}
                title={member.username}
              >
                {member.username.charAt(0).toUpperCase()}
              </div>
            ))}
            {roomInfo.members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs">
                +{roomInfo.members.length - 5}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowRoomInfo(!showRoomInfo)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showRoomInfo 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            ℹ️ Info
          </button>
          
          <button
            onClick={() => setShowChat(!showChat)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showChat 
                ? "bg-blue-600 text-white" 
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            💬 Chat
          </button>
          
          {roomInfo.type === "private" && roomInfo.uniqueCode && (
            <div className="bg-gray-700 px-3 py-1 rounded text-sm text-gray-300">
              Code: {roomInfo.uniqueCode}
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-gray-800 border-r border-gray-700">
          <FileExplorer
            roomId={roomId}
            files={files || []}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1">
            {activeFile ? (
              <CodeEditor
                file={activeFile}
                onExecute={setExecutionResult}
                roomMembers={roomInfo.members}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a file to start coding
              </div>
            )}
          </div>

          {/* Execution Panel */}
          {executionResult && (
            <div className="h-48 border-t border-gray-700">
              <ExecutionPanel result={executionResult} />
            </div>
          )}
        </div>

        {/* Room Info Panel */}
        {showRoomInfo && (
          <div className="w-80 border-l border-gray-700">
            <RoomInfoPanel 
              roomInfo={roomInfo} 
              onClose={() => setShowRoomInfo(false)}
            />
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="w-80 border-l border-gray-700">
            <RoomChat roomId={roomId} />
          </div>
        )}
      </div>
    </div>
  );
}
