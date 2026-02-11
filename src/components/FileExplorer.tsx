import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

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

  const getFileIcon = (language: string) => {
    const icons: Record<string, string> = {
      javascript: "📄",
      python: "🐍",
      html: "🌐",
      css: "🎨",
      c: "⚙️",
      cpp: "⚙️",
      react: "⚛️",
    };
    return icons[language] || "📄";
  };

  return (
    <div className="h-full bg-gray-800 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Files</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-gray-400 hover:text-white text-lg"
          >
            +
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="p-2">
        {files.map((file) => (
          <div
            key={file._id}
            className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-700 ${
              activeFileId === file._id ? "bg-gray-700" : ""
            }`}
            onClick={() => onFileSelect(file._id)}
          >
            <div className="flex items-center space-x-2">
              <span>{getFileIcon(file.language)}</span>
              <span className="text-sm">{file.name}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFile(file._id);
              }}
              className="text-gray-500 hover:text-red-400 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Create File Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <form onSubmit={handleCreateFile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">File Name</label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="example.js"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="react">React</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
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
