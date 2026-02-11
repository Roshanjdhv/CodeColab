import { useState, useEffect, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";
import { CodeMentorChat } from "./CodeMentorChat";

interface CodeEditorProps {
  file: any;
  onExecute: (result: any) => void;
  roomMembers: any[];
}

export function CodeEditor({ file, onExecute, roomMembers }: CodeEditorProps) {
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
    <div className="h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-medium">{file.name}</h3>
          <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {file.language}
          </span>
          {lastModifiedBy && (
            <span className="text-xs text-blue-400 animate-pulse">
              Modified by {lastModifiedBy}
            </span>
          )}
          {isLoadingAI && (
            <span className="text-xs text-purple-400 animate-pulse flex items-center space-x-1">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-400"></div>
              <span>CodeMentor working...</span>
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* AI Panel Toggle */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              showAIPanel
                ? "bg-purple-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            🤖 AI
          </button>
          
          {/* CodeMentor Chat */}
          <button
            onClick={() => setShowCodeMentor(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs rounded transition-colors"
            title="Chat with CodeMentor (Ctrl+/)"
          >
            💬 CodeMentor
          </button>
          
          {file.language === "html" && (
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                isPreviewMode
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {isPreviewMode ? "Code" : "Preview"}
            </button>
          )}
          
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-1 text-xs rounded transition-colors flex items-center space-x-1"
          >
            {isExecuting ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Running...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Run</span>
              </>
            )}
          </button>
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

          {/* Footer */}
          <div className="bg-gray-800 border-t border-gray-700 px-4 py-2 flex justify-between items-center text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Lines: {code.split('\n').length}</span>
              <span>Characters: {code.length}</span>
              <span>Language: {file.language}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Tab: AI Complete • Ctrl+Enter: Run • Ctrl+/: CodeMentor</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Real-time sync active"></div>
            </div>
          </div>
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-3 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h4 className="text-white font-medium flex items-center space-x-2">
                  <span>🤖</span>
                  <span>CodeMentor AI</span>
                </h4>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-3 space-y-2">
              <button
                onClick={handleOptimizeCode}
                disabled={isLoadingAI}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                ⚡ Optimize Code
              </button>
              
              <button
                onClick={() => setShowCodeMentor(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                💬 Ask CodeMentor
              </button>
            </div>
            
            {aiSuggestion && (
              <div className="flex-1 p-3 overflow-y-auto max-h-96">
                <div className="bg-gray-700 rounded p-3">
                  <h5 className="text-purple-400 font-medium mb-2">AI Suggestion:</h5>
                  <div className="text-gray-300 text-sm whitespace-pre-wrap overflow-y-auto max-h-80">
                    {aiSuggestion}
                  </div>
                </div>
              </div>
            )}
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
}
