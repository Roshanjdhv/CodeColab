import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { CodeEditor, CodeEditorHandle } from "./CodeEditor";
import { RoomChat } from "./RoomChat";
import { FileExplorer } from "./FileExplorer";
import { ExecutionPanel } from "./ExecutionPanel";
import { RoomInfoPanel } from "./RoomInfoPanel";
import { 
  Terminal, 
  ChevronLeft, 
  Info, 
  MessageSquare, 
  Play, 
  Zap, 
  BrainCircuit,
  Settings,
  ChevronDown
} from "lucide-react";

interface RoomViewProps {
  roomId: string;
  onLeave: () => void;
}

export function RoomView({ roomId, onLeave }: RoomViewProps) {
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const editorRef = useRef<CodeEditorHandle>(null);
  
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
    <div className="h-screen flex flex-col bg-[#0f0e1b] font-display text-slate-100 overflow-hidden">
      {/* Immersive Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0f0e1b] z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onLeave}
              className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all transform hover:-translate-x-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Terminal className="w-5 h-5" />
              </div>
              <h1 className="text-white text-lg font-bold tracking-tight">CodeCollab</h1>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-2"></div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none mb-0.5">Project</span>
              <span className="text-sm font-bold text-slate-200">{roomInfo.name}</span>
            </div>
            <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-wider">
              {roomInfo.language}
            </div>
            {roomInfo.type === "private" && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
                   <div className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                   Code: {roomInfo.uniqueCode}
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Collaborators */}
          <div className="flex items-center -space-x-2 mr-4">
            {roomInfo.members.slice(0, 3).map((member, i) => (
              <div
                key={member.userId}
                className="size-8 rounded-full border-2 border-[#0f0e1b] bg-slate-800 overflow-hidden ring-1 ring-white/5"
                title={member.username}
              >
                {member.profileImageUrl ? (
                    <img src={member.profileImageUrl} alt={member.username} className="w-full h-full object-cover" />
                ) : (
                    <div 
                        className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: member.userColor }}
                    >
                        {member.username.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
            ))}
            {roomInfo.members.length > 3 && (
              <div className="size-8 rounded-full border-2 border-[#0f0e1b] bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center ring-1 ring-white/5">
                +{roomInfo.members.length - 3}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
               onClick={() => setShowRoomInfo(!showRoomInfo)}
               className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all ${
                 showRoomInfo 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
               }`}
            >
              <Info className="w-4 h-4" />
              <span>Info</span>
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-bold transition-all ${
                showChat 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <div className="w-px h-6 bg-white/10 mx-1" />
            <button
              onClick={() => editorRef.current?.handleExecute()}
              className="flex items-center gap-2 px-6 h-10 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 group"
            >
              <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Pane */}
        <aside className="w-64 bg-[#121121] border-r border-white/5 flex flex-col shadow-2xl z-20">
          <FileExplorer
            roomId={roomId}
            files={files || []}
            activeFileId={activeFileId}
            onFileSelect={setActiveFileId}
          />
        </aside>

        {/* Code Editor Center Pane */}
        <main className="flex-1 flex flex-col bg-[#1e1e2e] relative group">
          <div className="absolute inset-0 bg-primary/2 dark:bg-primary/5 pointer-events-none" />
          {activeFile ? (
            <div className="flex-1 flex flex-col relative z-10">
              <CodeEditor
                ref={editorRef}
                file={activeFile}
                onExecute={setExecutionResult}
                roomMembers={roomInfo.members}
              />
              
              {/* Floating Execution Result */}
              {executionResult && (
                <div className="absolute bottom-6 left-6 right-6 max-h-60 bg-[#0f0e1b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
                   <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Console Output</span>
                      <button onClick={() => setExecutionResult(null)} className="text-slate-500 hover:text-white transition-colors">
                        <ChevronLeft className="w-4 h-4 rotate-90" />
                      </button>
                   </div>
                   <div className="p-4 px-6 overflow-y-auto max-h-48 font-mono text-sm">
                      <ExecutionPanel result={executionResult} />
                   </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4 relative z-10">
              <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Terminal className="w-8 h-8 opacity-20" />
              </div>
              <p className="font-medium">Select a file from the explorer to start coding</p>
            </div>
          )}
        </main>

        {/* Collaboration Pane (Chat / Info Overlay) */}
        {(showChat || showRoomInfo) && (
          <aside className="w-80 flex flex-col border-l border-white/5 bg-[#121121] shadow-2xl animate-in slide-in-from-right duration-300 z-30">
            {showChat ? (
                <RoomChat roomId={roomId} />
            ) : (
                <RoomInfoPanel 
                  roomInfo={roomInfo} 
                  onClose={() => setShowRoomInfo(false)}
                />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
