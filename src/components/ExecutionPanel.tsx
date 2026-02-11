import { useState } from "react";

interface ExecutionPanelProps {
  result: {
    output: string;
    error?: string;
    executionTime: number;
  };
}

export function ExecutionPanel({ result }: ExecutionPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const copyToClipboard = () => {
    const text = result.error || result.output;
    navigator.clipboard.writeText(text);
  };

  const clearOutput = () => {
    // This would need to be passed as a prop from parent
    // For now, just copy functionality
  };

  const formatExecutionTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getStatusIcon = () => {
    if (result.error) return "❌";
    return "✅";
  };

  const getStatusColor = () => {
    if (result.error) return "text-red-400";
    return "text-green-400";
  };

  return (
    <div className="h-full bg-gray-900 border-t border-gray-700 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
          <div className="flex items-center space-x-2">
            <span className={`text-lg ${getStatusColor()}`}>
              {getStatusIcon()}
            </span>
            <h3 className="text-white font-medium">
              {result.error ? "Execution Failed" : "Execution Successful"}
            </h3>
          </div>
          <span className="text-gray-400 text-sm">
            {formatExecutionTime(result.executionTime)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
            title="Copy output"
          >
            <span>📋</span>
            <span>Copy</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            title={isExpanded ? "Minimize" : "Expand"}
          >
            {isExpanded ? "−" : "□"}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {result.error ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-red-400 font-semibold">
                  <span className="text-red-500">🚨</span>
                  <span>Error Details:</span>
                </div>
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                  <pre className="text-red-300 font-mono text-sm whitespace-pre-wrap break-words">
                    {result.error}
                  </pre>
                </div>
                {result.output && (
                  <>
                    <div className="flex items-center space-x-2 text-yellow-400 font-semibold mt-4">
                      <span className="text-yellow-500">⚠️</span>
                      <span>Partial Output:</span>
                    </div>
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                      <pre className="text-yellow-200 font-mono text-sm whitespace-pre-wrap break-words">
                        {result.output}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-green-400 font-semibold">
                  <span className="text-green-500">🎉</span>
                  <span>Output:</span>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <pre className="text-green-200 font-mono text-sm whitespace-pre-wrap break-words">
                    {result.output || "No output generated"}
                  </pre>
                </div>
                
                {/* Performance Info */}
                <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-700">
                  <span>Execution completed successfully</span>
                  <span>Time: {formatExecutionTime(result.executionTime)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="border-t border-gray-700 px-4 py-2 bg-gray-800/50">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center space-x-4">
                <span>💡 Tip: Use Ctrl+Enter to run code quickly</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Lines: {(result.output || result.error || "").split('\n').length}</span>
                <span>•</span>
                <span>Chars: {(result.output || result.error || "").length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
