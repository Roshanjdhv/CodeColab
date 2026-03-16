import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { CodeMentorChat } from "./CodeMentorChat";
import { 
  Play, 
  Zap, 
  BrainCircuit, 
  Sparkles, 
  Terminal, 
  FileCode, 
  X,
  ChevronDown,
  Monitor,
  GitBranch,
  RefreshCw,
  Cpu
} from "lucide-react";

interface CodeEditorProps {
  file: any;
  onExecute: (result: any) => void;
  roomMembers: any[];
}

export interface CodeEditorHandle {
  handleExecute: () => Promise<void>;
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(({ file, onExecute, roomMembers }, ref) => {
  const [code, setCode] = useState(file?.content || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastModifiedBy, setLastModifiedBy] = useState<string | null>(null);
  const [showCodeMentor, setShowCodeMentor] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const updateFileContent = useMutation(api.files.updateFileContent);
  const executeCode = useAction(api.execution.executeCode);
  const completeCode = useAction(api.codementor.completeCode);
  const analyzeError = useAction(api.codementor.analyzeError);
  const optimizeCode = useAction(api.codementor.optimizeCode);

  const handleExecute = async () => {
    if (!file) return;
    
    setIsExecuting(true);
    try {
      const result = await executeCode({
        roomId: file.roomId as Id<"rooms">,
        fileId: file._id as Id<"files">,
        language: file.language,
        code: code,
      });
      
      // If there's an error, offer AI analysis
      if (result.error) {
        setAiSuggestion(`Error detected: ${result.error}`);
        setShowAIPanel(true);
      }
      
      onExecute(result);
      toast.success("Code executed successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Execution failed";
      toast.error("Failed to execute code");
      onExecute({
        output: "",
        error: errorMessage,
        executionTime: 0,
      });
      
      // Offer AI error analysis
      setAiSuggestion(`Execution error: ${errorMessage}`);
      setShowAIPanel(true);
    } finally {
      setIsExecuting(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handleExecute
  }));

  // Update local code when file content changes (real-time from other users)
  useEffect(() => {
    if (file?.content !== undefined && file.content !== code) {
      setCode(file.content);
      
      // Show who made the change
      if (file.lastModifiedBy) {
        const modifier = roomMembers.find(m => m.userId === file.lastModifiedBy);
        if (modifier) {
          setLastModifiedBy(modifier.username);
          setTimeout(() => setLastModifiedBy(null), 3000);
        }
      }
    }
  }, [file?.content, file?.lastModifiedBy, roomMembers]);

  // Real-time update function (like chat)
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout for real-time update
    updateTimeoutRef.current = setTimeout(async () => {
      if (file && newCode !== file.content) {
        try {
          await updateFileContent({ 
            fileId: file._id as Id<"files">, 
            content: newCode 
          });
        } catch (error) {
          console.error("Failed to update file:", error);
        }
      }
    }, 500); // Update after 500ms of inactivity
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);


  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      
      // AI Code Completion on Tab
      if (file && textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart;
        
        setIsLoadingAI(true);
        try {
          const completion = await completeCode({
            code,
            language: file.language,
            cursorPosition,
          });
          
          if (completion.success && completion.completion) {
            const newCode = code.substring(0, cursorPosition) + completion.completion + code.substring(cursorPosition);
            handleCodeChange(newCode);
            
            // Move cursor after completion
            setTimeout(() => {
              if (textareaRef.current) {
                const newPosition = cursorPosition + completion.completion.length;
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newPosition;
              }
            }, 0);
            
            toast.success("Code completed by CodeMentor!");
          } else {
            // Fallback to regular tab
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const newCode = code.substring(0, start) + "  " + code.substring(end);
            handleCodeChange(newCode);
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
              }
            }, 0);
          }
        } catch (error) {
          // Fallback to regular tab
          const start = textareaRef.current.selectionStart;
          const end = textareaRef.current.selectionEnd;
          const newCode = code.substring(0, start) + "  " + code.substring(end);
          handleCodeChange(newCode);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
            }
          }, 0);
        } finally {
          setIsLoadingAI(false);
        }
      }
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
    
    // AI Chat shortcut
    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      e.preventDefault();
      setShowCodeMentor(true);
    }
  };

  const handleAnalyzeError = async (errorMessage: string) => {
    if (!file) return;
    
    setIsLoadingAI(true);
    try {
      const analysis = await analyzeError({
        code,
        error: errorMessage,
        language: file.language,
      });
      
      if (analysis.success) {
        setAiSuggestion(`**Error Analysis:**\n${analysis.explanation}\n\n**Fix:**\n${analysis.fixExplanation}`);
        
        // Optionally apply the corrected code
        if (analysis.correctedCode !== code) {
          const applyFix = window.confirm("CodeMentor found a fix for this error. Apply it?");
          if (applyFix) {
            handleCodeChange(analysis.correctedCode);
            toast.success("Code fixed by CodeMentor!");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to analyze error");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleOptimizeCode = async () => {
    if (!file) return;
    
    setIsLoadingAI(true);
    try {
      const optimization = await optimizeCode({
        code,
        language: file.language,
      });
      
      if (optimization.success) {
        setAiSuggestion(`**Optimization Suggestions:**\n${optimization.suggestions.join('\n')}\n\n**Explanation:**\n${optimization.explanation}`);
        
        // Optionally apply optimized code
        if (optimization.optimizedCode !== code) {
          const applyOptimization = window.confirm("CodeMentor has optimized your code. Apply the improvements?");
          if (applyOptimization) {
            handleCodeChange(optimization.optimizedCode);
            toast.success("Code optimized by CodeMentor!");
          }
        }
      }
    } catch (error) {
      toast.error("Failed to optimize code");
    } finally {
      setIsLoadingAI(false);
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Select a file to start coding</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#1e1e2e] font-display overflow-hidden">
      {/* Editor Tabs - Hidden on small mobile */}
      <div className="hidden sm:flex items-center bg-[#181825] h-10 px-2 gap-px border-b border-black/20">
        <div className="flex items-center gap-2 px-4 h-full bg-[#1e1e2e] text-white text-xs font-medium border-t-2 border-primary group relative shadow-sm">
          <FileCode className="w-3.5 h-3.5 text-amber-500" />
          <span>{file.name}</span>
          <X className="w-3 h-3 text-slate-500 hover:bg-white/10 rounded ml-1 transition-colors cursor-pointer" />
        </div>
        {/* Mock for other tab */}
        <div className="flex items-center gap-2 px-4 h-full text-slate-500 text-xs font-medium hover:bg-white/5 cursor-pointer transition-colors group">
           <FileCode className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
           <span>config.json</span>
        </div>
      </div>

      {/* Toolbar Above Code - Adaptive for mobile */}
      <div className="bg-[#1e1e2e] border-b border-white/5 px-3 md:px-4 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 z-10">
        <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto no-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden xs:block">File</span>
            <div className="flex items-center gap-2 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
              <span className="text-xs font-bold text-slate-200">{file.name}</span>
            </div>
          </div>
          
          {lastModifiedBy && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full animate-in fade-in zoom-in flex-shrink-0">
              <div className="size-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                {lastModifiedBy} editing
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end overflow-x-auto no-scrollbar">
          {/* AI Panel Toggle */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex-shrink-0 ${
              showAIPanel
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden xs:block">Analysis</span>
          </button>
          
          {/* CodeMentor Chat */}
          <button
            onClick={() => setShowCodeMentor(true)}
            className="flex items-center gap-2 px-3 h-8 rounded-lg bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 flex-shrink-0"
            title="Chat with CodeMentor (Ctrl+/)"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span className="hidden xs:block">Mentor</span>
          </button>
          
          {file.language === "html" && (
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex-shrink-0 ${
                isPreviewMode
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xs:block">{isPreviewMode ? "Source" : "Preview"}</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            {isPreviewMode && file.language === "html" ? (
              <iframe
                srcDoc={code}
                className="w-full h-full border-0 bg-white"
                title="HTML Preview"
              />
            ) : (
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-full bg-gray-900 text-gray-100 font-mono text-sm p-4 border-0 outline-0 resize-none"
                placeholder={`Start coding in ${file.language}... (Tab for AI completion, Ctrl+/ for CodeMentor)`}
                spellCheck={false}
              />
            )}
          </div>

          {/* Premium Status Bar */}
          <div className="h-6 bg-primary text-white flex justify-between items-center px-4 text-[9px] font-bold uppercase tracking-wider relative z-20 shadow-[0_-2px_10px_rgba(80,72,229,0.3)]">
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-1.5 group cursor-pointer hover:text-white/80 transition-colors">
                <GitBranch className="w-2.5 h-2.5" />
                <span>main*</span>
              </div>
              <div className="flex items-center gap-1.5 group cursor-pointer hover:text-white/80 transition-colors">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>Synced</span>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <span>Lines: {code.split('\n').length}</span>
              <span>Col 12</span>
              <span>Spaces: 4</span>
              <span>UTF-8</span>
              <div className="size-1 w-px bg-white/30 h-3" />
              <div className="flex items-center gap-2 text-emerald-300">
                <div className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>Neural Engine Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Panel Pane */}
        {showAIPanel && (
          <div className="w-80 bg-[#121121] border-l border-white/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-purple-500 rounded flex items-center justify-center text-white">
                     <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-white text-[10px] font-bold uppercase tracking-widest">CodeMentor AI</h4>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleOptimizeCode}
                  disabled={isLoadingAI}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
                >
                  <Zap className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Optimize</span>
                </button>
                
                <button
                  onClick={() => setShowCodeMentor(true)}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group"
                >
                  <BrainCircuit className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Mentor</span>
                </button>
              </div>
              
              {aiSuggestion && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Sparkles className="w-12 h-12 text-purple-400" />
                    </div>
                    <h5 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3">AI Intelligence</h5>
                    <div className="text-slate-300 text-xs leading-relaxed prose prose-invert prose-sm max-w-none">
                      {aiSuggestion}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CodeMentor Chat Modal */}
      <CodeMentorChat
        isOpen={showCodeMentor}
        onClose={() => setShowCodeMentor(false)}
        currentCode={code}
        currentLanguage={file.language}
      />
    </div>
  );
});
