import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { 
  FileCode, 
  Folder, 
  Plus, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  Settings,
  Terminal,
  FileText,
  Palette,
  FileJson
} from "lucide-react";

interface FileExplorerProps {
  roomId: string;
  files: any[];
  activeFileId: string | null;
  onFileSelect: (fileId: string) => void;
}

export function FileExplorer({ roomId, files, activeFileId, onFileSelect }: FileExplorerProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileLanguage, setNewFileLanguage] = useState("javascript");
  
  const createFile = useMutation(api.files.createFile);
  const deleteFile = useMutation(api.files.deleteFile);

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    try {
      const fileId = await createFile({
        roomId: roomId as Id<"rooms">,
        name: newFileName.trim(),
        language: newFileLanguage,
      });
      onFileSelect(fileId);
      setNewFileName("");
      setShowCreateModal(false);
      toast.success("File created!");
    } catch (error) {
      toast.error("Failed to create file");
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await deleteFile({ fileId: fileId as Id<"files"> });
      toast.success("File deleted!");
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const currentProfile = useQuery(api.profiles.getCurrentProfile);

  const getFileIcon = (language: string) => {
    const iconClass = "w-4 h-4";
    const icons: Record<string, JSX.Element> = {
      javascript: <FileCode className={`${iconClass} text-amber-400`} />,
      python: <FileCode className={`${iconClass} text-sky-400`} />,
      html: <FileText className={`${iconClass} text-orange-400`} />,
      css: <Palette className={`${iconClass} text-pink-400`} />,
      c: <Settings className={`${iconClass} text-slate-400`} />,
      cpp: <Settings className={`${iconClass} text-blue-400`} />,
      react: <FileCode className={`${iconClass} text-cyan-400`} />,
      json: <FileJson className={`${iconClass} text-yellow-500`} />,
    };
    return icons[language] || <FileText className={`${iconClass} text-slate-400`} />;
  };

  return (
    <div className="h-full bg-[#121121] text-slate-300 flex flex-col font-display border-r border-white/5 shadow-2xl">
      {/* Search/Header */}
      <div className="p-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Explorer</span>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-primary transition-all active:scale-90"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:bg-white/5 cursor-pointer transition-colors uppercase tracking-wider">
           <Folder className="w-3.5 h-3.5" />
           <span>src</span>
        </div>
        
        <div className="space-y-0.5 ml-2 border-l border-white/5 pl-2">
          {files.map((file) => (
            <div
              key={file._id}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 ${
                activeFileId === file._id 
                  ? "bg-primary/10 text-primary font-bold shadow-sm" 
                  : "hover:bg-white/5 text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => onFileSelect(file._id)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">
                  {getFileIcon(file.language)}
                </div>
                <span className="text-sm truncate leading-none">{file.name}</span>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file._id);
                  }}
                  className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-white/5 bg-[#0a0a14]/50">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group shadow-sm">
          <div className="size-9 rounded-xl overflow-hidden shrink-0 shadow-lg ring-1 ring-white/10">
            {currentProfile?.profileImageUrl ? (
              <img 
                src={currentProfile.profileImageUrl} 
                alt="Profile" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: currentProfile?.userColor || "#5048e5" }}
              >
                {currentProfile?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-100 truncate leading-none mb-1">{currentProfile?.username || "Loading..."}</p>
            <div className="flex items-center gap-1.5">
               <div className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
               <p className="text-[10px] text-slate-400 font-medium">Online</p>
            </div>
          </div>
          <MoreVertical className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>

  {/* Create File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <div className="bg-[#121121] rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-white/5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
               <FileCode className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Create New File</h3>
            <p className="text-slate-500 text-sm mb-6">Start a new collaboration by choosing a name and technical stack.</p>
            
            <form onSubmit={handleCreateFile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-100 placeholder:text-slate-600"
                  placeholder="e.g. main.py"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Language</label>
                <div className="relative">
                  <select
                    value={newFileLanguage}
                    onChange={(e) => setNewFileLanguage(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 rounded-xl border border-white/5 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-200 appearance-none cursor-pointer"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="c">C</option>
                    <option value="cpp">C++</option>
                    <option value="react">React</option>
                    <option value="json">JSON</option>
                  </select>
                  <ChevronRight className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-slate-400 font-bold hover:text-white hover:bg-white/5 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
