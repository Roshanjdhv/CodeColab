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
  const [showExplorer, setShowExplorer] = useState(true);
  const [activeMobileTab, setActiveMobileTab] = useState<'editor' | 'chat' | 'info' | 'mentor'>('editor');
  const [executionResult, setExecutionResult] = useState<any>(null);
  const editorRef = useRef<CodeEditorHandle>(null);
  
  const roomInfo = useQuery(api.rooms.getRoomInfo, { roomId: roomId as Id<"rooms"> });
  const files = useQuery(api.files.getRoomFiles, { roomId: roomId as Id<"rooms"> });
  const activeFile = useQuery(api.files.getFile, 
    activeFileId ? { fileId: activeFileId as Id<"files"> } : "skip"
  );

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowExplorer(false);
      } else {
        setShowExplorer(true);
        if (activeMobileTab !== 'editor') setActiveMobileTab('editor');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (files && files.length > 0 && !activeFileId) {
      setActiveFileId(files[0]._id);
    }
  }, [files, activeFileId]);

  if (!roomInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Room not found</h2>
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
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-[#0f0e1b] z-50">
        <div className="flex items-center gap-2 md:gap-6">
          <div className="flex items-center gap-2 md:gap-4">
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
              <h1 className="text-white text-lg font-bold tracking-tight hidden md:block">CodeCollab</h1>
            </div>
          </div>
          
          <div className="h-6 w-px bg-white/10 mx-1 md:mx-2"></div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] md:text-[10px] uppercase font-bold text-slate-500 tracking-widest leading-none mb-0.5">Project</span>
              <span className="text-xs md:text-sm font-bold text-slate-200 truncate max-w-[100px] md:max-w-none">{roomInfo.name}</span>
            </div>
            <div className="hidden sm:block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full border border-primary/20 uppercase tracking-wider">
              {roomInfo.language}
            </div>
            {roomInfo.type === "private" && (
                <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] md:text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-wider">
                   <div className="size-1.5 rounded-full bg-amber-500 animate-pulse hidden md:block" />
                   {roomInfo.uniqueCode}
                </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowExplorer(!showExplorer)}
            className={`md:hidden p-2 rounded-lg transition-all ${
              showExplorer ? "bg-primary text-white" : "bg-white/5 text-slate-400"
            }`}
          >
            <Zap className="w-5 h-5" />
          </button>

          {/* Active Collaborators - Compact on mobile */}
          <div className="flex items-center -space-x-2 mr-1 md:mr-4">
            {roomInfo.members.slice(0, window.innerWidth < 640 ? 2 : 3).map((member, i) => (
              <div
                key={member.userId}
                className="size-7 md:size-8 rounded-full border-2 border-[#0f0e1b] bg-slate-800 overflow-hidden ring-1 ring-white/5"
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
          </div>

          <div className="hidden md:flex items-center gap-2">
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
          
          <button
              onClick={() => editorRef.current?.handleExecute()}
              className="md:hidden size-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* File Explorer Pane - Drawer behavior on mobile */}
        <aside 
          className={`absolute md:relative inset-y-0 left-0 w-64 bg-[#121121] border-r border-white/5 flex flex-col shadow-2xl z-40 transition-transform duration-300 md:translate-x-0 ${
            showExplorer ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex md:hidden p-4 justify-between items-center border-b border-white/5">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Explorer</span>
            <button onClick={() => setShowExplorer(false)} className="text-slate-500 p-1">
              <ChevronDown className="w-6 h-6 rotate-90" />
            </button>
          </div>
          <FileExplorer
            roomId={roomId}
            files={files || []}
            activeFileId={activeFileId}
            onFileSelect={(id) => {
              setActiveFileId(id);
              if (window.innerWidth < 768) setShowExplorer(false);
            }}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#1e1e2e] relative group overflow-hidden">
          <div className="absolute inset-0 bg-primary/2 dark:bg-primary/5 pointer-events-none" />
          
          {/* Mobile Tab Content */}
          <div className="flex-1 flex flex-col z-10 overflow-hidden">
            {activeMobileTab === 'editor' ? (
              activeFile ? (
                <div className="flex-1 flex flex-col relative">
                  <CodeEditor
                    ref={editorRef}
                    file={activeFile}
                    onExecute={setExecutionResult}
                    roomMembers={roomInfo.members}
                  />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                  <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Terminal className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-medium px-6 text-center">Select a file from the explorer to start coding</p>
                  <button 
                    onClick={() => setShowExplorer(true)}
                    className="md:hidden px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-bold"
                  >
                    Open Explorer
                  </button>
                </div>
              )
            ) : activeMobileTab === 'chat' ? (
              <div className="flex-1 overflow-hidden">
                 <RoomChat roomId={roomId} />
              </div>
            ) : activeMobileTab === 'info' ? (
              <div className="flex-1 overflow-hidden p-4">
                 <RoomInfoPanel 
                    roomInfo={roomInfo} 
                    onClose={() => setActiveMobileTab('editor')}
                 />
              </div>
            ) : activeMobileTab === 'mentor' && (
              <div className="flex-1 flex flex-col bg-[#0f0e1b] p-4">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-bold flex items-center gap-2">
                     <BrainCircuit className="w-5 h-5 text-primary" />
                     CodeMentor
                   </h3>
                   <button onClick={() => setActiveMobileTab('editor')} className="text-slate-500">
                     <ChevronDown className="w-6 h-6 rotate-90" />
                   </button>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-slate-500">
                   <p className="text-sm">Mentor controls are available in the editor toolbar</p>
                </div>
              </div>
            )}
            
            {/* Floating Execution Result */}
            {executionResult && activeMobileTab === 'editor' && (
              <div className="absolute bottom-6 left-4 right-4 md:left-6 md:right-6 max-h-[40%] bg-[#0f0e1b]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 z-50">
                 <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Console Output</span>
                    <button onClick={() => setExecutionResult(null)} className="text-slate-500 hover:text-white transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                 </div>
                 <div className="p-4 px-6 overflow-y-auto max-h-48 font-mono text-xs md:text-sm">
                    <ExecutionPanel result={executionResult} />
                 </div>
              </div>
            )}
          </div>
        </main>

        {/* Desktop Collaboration Pane */}
        <aside className="hidden md:flex w-80 flex-col border-l border-white/5 bg-[#121121] shadow-2xl z-30 overflow-hidden">
          {(showChat || showRoomInfo) ? (
            showChat ? (
                <RoomChat roomId={roomId} />
            ) : (
                <RoomInfoPanel 
                  roomInfo={roomInfo} 
                  onClose={() => setShowRoomInfo(false)}
                />
            )
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 opacity-30">
               <MessageSquare className="w-8 h-8" />
               <p className="text-xs uppercase font-bold tracking-widest">Collaboration</p>
            </div>
          )}
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden flex items-center justify-around h-16 bg-[#0f0e1b] border-t border-white/5 px-2 z-50">
        <button 
          onClick={() => setActiveMobileTab('editor')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeMobileTab === 'editor' ? "text-primary scale-110" : "text-slate-500"
          }`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Editor</span>
        </button>
        <button 
          onClick={() => setActiveMobileTab('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeMobileTab === 'chat' ? "text-primary scale-110" : "text-slate-500"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Chat</span>
        </button>
        <button 
           onClick={() => setActiveMobileTab('mentor')}
           className={`flex flex-col items-center gap-1 transition-all ${
             activeMobileTab === 'mentor' ? "text-primary scale-110" : "text-slate-500"
           }`}
        >
          <BrainCircuit className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">AI Mentor</span>
        </button>
        <button 
          onClick={() => setActiveMobileTab('info')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeMobileTab === 'info' ? "text-primary scale-110" : "text-slate-500"
          }`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Info</span>
        </button>
      </nav>
    </div>
  );
}
