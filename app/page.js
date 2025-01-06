"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import data from "./data.json";

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [botTyping, setBotTyping] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const userMsg = { id: Date.now(), role: "user", text: inputVal };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    // Simulate bot typing
    setBotTyping(true);
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        role: "bot",
        text: getBotResponse(userMsg.text),
      };
      setMessages((prev) => [...prev, botMsg]);
      setBotTyping(false);
    }, 1200);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Example quick replies
  const quickReplies = [
    "How do I search for people?",
    "Which region values exist?",
    "Email enrichment?",
  ];

  const handleQuickReply = (text) => {
    setInputVal(text);
    handleSend();
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6">
      {/* Title */}
      <h1 className="text-2xl md:text-3xl neon-text font-bold mb-4">
        CrustData ChatBot
      </h1>

      {/* The main futuristic circular dial */}
      <div className="futuristic-dial mb-6 relative flex items-center justify-center">
        <div className="dial-center" />
        {/* You could place a small chat-bot icon or text in the center if you want */}
      </div>

      {/* Chat Box */}
      <div
        className="w-full max-w-md flex flex-col rounded-lg p-3"
        style={{
          backgroundColor: "rgba(10,10,42, 0.6)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 0 16px rgba(165, 0, 255, 0.2)",
          border: "1px solid rgba(0, 234, 255, 0.3)",
        }}
      >
        {/* Chat messages */}
        <div className="flex-1 mb-2 overflow-y-auto max-h-96 custom-scrollbar p-2 space-y-2">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative px-4 py-2 rounded-lg text-sm 
                    ${
                      msg.role === "user"
                        ? "bg-neonPink text-white"
                        : "bg-neonBlue text-gray-900"
                    }
                    max-w-[75%] whitespace-pre-wrap
                  `}
                  style={{
                    boxShadow: "0 0 8px rgba(255, 0, 255, 0.3), 0 0 12px rgba(0, 255, 255, 0.2)",
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Bot typing indicator */}
          {botTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
              className="flex justify-start"
            >
              <div
                className="px-4 py-2 rounded-lg text-sm bg-neonBlue text-gray-900 max-w-[75%]"
                style={{
                  boxShadow:
                    "0 0 8px rgba(255, 0, 255, 0.3), 0 0 12px rgba(0, 255, 255, 0.2)",
                }}
              >
                <span className="animate-pulse">...</span>
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Reply Buttons */}
        <div className="flex flex-wrap gap-2 mb-2">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              className="btn-neon px-3 py-1 text-sm rounded bg-transparent text-neonBlue border border-neonBlue"
              onClick={() => handleQuickReply(qr)}
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 rounded px-3 py-2 text-sm text-gray-200 bg-gray-800 focus:outline-none border border-gray-600"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="btn-neon px-4 py-2 text-sm rounded bg-transparent text-neonPink border border-neonPink"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Basic Level 0 bot logic
function getBotResponse(question) {
  const q = question.toLowerCase();

  if (q.includes("search for people")) {
    return data["search for people"];
  }
  if (q.includes("region")) {
    return data["region"];
  }
  if (q.includes("email") || q.includes("enrichment")) {
    return data["email/enrichment"];
  }
  return data["fallback"];
}
