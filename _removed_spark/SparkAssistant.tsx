import React, { useEffect, useRef, useState } from "react";
import { getSparkyResponse } from "../services/geminiService";
import type { ChatMessage } from "../types";

const SparkAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", text: "Hi! I am Sparky. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = { role: "user", text: trimmed };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await getSparkyResponse(nextMessages, trimmed);
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="glass w-80 md:w-96 h-[500px] flex flex-col rounded-3xl shadow-2xl border border-brand-light/20 overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-light rounded-full flex items-center justify-center text-brand-dark font-bold">
                S
              </div>
              <div>
                <h3 className="font-bold text-sm">Spark Assistant</h3>
                <p className="text-[10px] opacity-80 text-brand-light">
                  Online & Ready to Help
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="hover:bg-brand-light/10 rounded-full p-2 transition-colors"
              aria-label="Close chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-brand-light text-brand-dark font-medium rounded-tr-none"
                      : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none animate-pulse text-slate-500">
                  Sparky is thinking...
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask about admissions..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-light outline-none"
              disabled={isLoading}
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading}
              className={`p-2 rounded-xl transition-colors ${
                isLoading
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-brand-dark text-white hover:bg-brand-light"
              }`}
              aria-label="Send message"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22l-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-brand-dark rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform active:scale-95 relative"
          aria-label="Open chat"
        >
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-light rounded-full animate-ping" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-light rounded-full border-2 border-white" />

          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            <path d="M8 10h.01" />
            <path d="M12 10h.01" />
            <path d="M16 10h.01" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SparkAssistant;
