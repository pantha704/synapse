"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Loader2, ChevronDown, BookOpen } from "lucide-react";
import { chatWithSubject } from "@/app/actions/chat-actions";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Array<{ content: string; score: number; topicId: string }>;
}

interface AIChatPanelProps {
  subjectId: string;
  supabaseUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIChatPanel({ subjectId, supabaseUserId, isOpen, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSources, setShowSources] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatWithSubject(supabaseUserId, subjectId, userMessage);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: result.response,
        sources: result.sources
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSources = (idx: number) => {
    setShowSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-16 bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-900">Ask AI Tutor</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Ask me anything about this subject</p>
                <p className="text-xs text-gray-400 mt-1">I'll use course materials to answer</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-900 rounded-bl-md"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200/50">
                      <button
                        onClick={() => toggleSources(idx)}
                        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700"
                      >
                        <ChevronDown className={`w-3 h-3 transition-transform ${showSources[idx] ? "rotate-180" : ""}`} />
                        {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""} used
                      </button>
                      <AnimatePresence>
                        {showSources[idx] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-1 space-y-1"
                          >
                            {msg.sources.map((source, sIdx) => (
                              <div key={sIdx} className="text-[10px] text-gray-400 bg-gray-50 rounded p-2">
                                <span className="font-medium text-gray-500">Source {sIdx + 1}</span>
                                <span className="ml-1">(score: {source.score.toFixed(2)})</span>
                                <p className="mt-0.5 line-clamp-2">{source.content}...</p>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this subject..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-3 py-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Floating trigger button
export function AIChatTrigger({ onClick, isActive }: { onClick: () => void; isActive: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed bottom-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors ${
        isActive
          ? "bg-indigo-500 text-white shadow-indigo-500/30"
          : "bg-white text-gray-600 shadow-gray-200 hover:bg-gray-50"
      }`}
    >
      <MessageSquare className="w-5 h-5" />
    </motion.button>
  );
}
