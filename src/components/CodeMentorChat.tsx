import { useState, useRef, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface CodeMentorChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode?: string;
  currentLanguage?: string;
}

export function CodeMentorChat({ isOpen, onClose, currentCode, currentLanguage }: CodeMentorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm CodeMentor, your AI coding assistant. I can help you with:\n\n• Code explanations and reviews\n• Debugging and error fixing\n• Best practices and optimization\n• Learning new concepts\n• Code completion suggestions\n\nHow can I help you today?",
      timestamp: Date.now(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [includeCode, setIncludeCode] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWithCodeMentor = useAction(api.codementor.chatWithCodeMentor);
  const explainCode = useAction(api.codementor.explainCode);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await chatWithCodeMentor({
        message: inputMessage,
        code: includeCode ? currentCode : undefined,
        language: includeCode ? currentLanguage : undefined,
        conversationHistory,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.reply,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (!response.success) {
        toast.error("CodeMentor is having trouble. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to get response from CodeMentor");
      console.error("CodeMentor chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainCode = async () => {
    if (!currentCode || !currentLanguage || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = {
      role: "user",
      content: `Please explain this ${currentLanguage} code:`,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await explainCode({
        code: currentCode,
        language: currentLanguage,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.explanation,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (!response.success) {
        toast.error("Failed to explain code");
      }
    } catch (error) {
      toast.error("Failed to get code explanation");
      console.error("Code explanation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat cleared! How can I help you with your code today?",
        timestamp: Date.now(),
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">CodeMentor</h3>
              <p className="text-xs opacity-90">Your AI Coding Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={clearChat}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
              title="Clear chat"
            >
              🗑️
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {currentCode && (
          <div className="p-3 bg-gray-50 border-b flex items-center space-x-2">
            <button
              onClick={handleExplainCode}
              disabled={isLoading}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200 disabled:opacity-50 transition-colors"
            >
              📖 Explain Current Code
            </button>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={includeCode}
                onChange={(e) => setIncludeCode(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Include current code in messages</span>
            </label>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="whitespace-pre-wrap text-sm break-words overflow-wrap-anywhere">{message.content}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">CodeMentor is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask CodeMentor anything about your code..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            💡 Try asking: "Explain this function", "How can I optimize this?", "What's wrong with my code?"
          </div>
        </form>
      </div>
    </div>
  );
}
