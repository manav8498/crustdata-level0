"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three"; 
import NET from "vanta/dist/vanta.net.min";
import { Typewriter } from "react-simple-typewriter";

import data from "./data.json";
import regionData from "./region_list.json";
import knowledgeBase from "./knowledge_base.json";

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, botTyping]);

  // Vanta background
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE: THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xff0077,
          backgroundColor: 0x0b0b2c,
          points: 9.0,
          maxDistance: 20.0,
          spacing: 15.0,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // Handle Send
  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: inputVal };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");

    setBotTyping(true);

    setTimeout(() => {
      const botReply = getBotResponse(userMsg.text, messages);
      const botMsg = { id: Date.now() + 1, role: "bot", text: botReply };
      setMessages((prev) => [...prev, botMsg]);
      setBotTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  // Quick replies: 
  // We can include some Slack-based queries to test knowledge_base
  const quickReplies = [
    "How do I search for people?",
    "Which region values exist?",
    "Email enrichment?",
    "Show me screener/person/search with region=SF",
    "Any Slack logs about normalizing location?",
    "Where do i find more doc about screener endpoints from slack channel #api-support?"
  ];

  const handleQuickReply = (text) => {
    setInputVal(text);
    handleSend();
  };

  return (
    <main
      ref={vantaRef}
      className="relative min-h-screen w-full flex flex-col items-center justify-center text-gray-100"
      style={{
        backgroundColor: "#0b0b2c",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-30" />

      <div className="z-10 mt-8 mb-4 text-center">
        <h1 className="text-3xl font-bold uppercase tracking-wide">
          CrustData ChatBot (Level 2)
        </h1>
        <p className="text-sm opacity-80">
          Agentic + Additional Knowledge Base (Slack, Docs)
        </p>
      </div>

      <div
        className="z-10 w-full max-w-xl flex flex-col rounded-xl border border-pink-500 bg-black bg-opacity-50
                  px-4 py-3 shadow-lg"
        style={{
          backdropFilter: "blur(6px)",
        }}
      >
        {/* Chat area */}
        <div className="flex-1 overflow-y-auto max-h-96 px-2 py-2 space-y-3 custom-scrollbar">
          <AnimatePresence initial={false}>
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
                  className={`relative px-4 py-2 rounded-md text-sm max-w-[70%] leading-relaxed whitespace-pre-wrap 
                    ${
                      msg.role === "user"
                        ? "bg-neonPink text-white shadow-neon-pink"
                        : "bg-neonBlue text-gray-800 shadow-neon-blue"
                    }
                  `}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {botTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="flex justify-start"
            >
              <div className="px-4 py-2 rounded-md text-sm bg-neonBlue text-gray-800 shadow-neon-blue max-w-[70%]">
                <Typewriter
                  words={["..."]}
                  loop={false}
                  cursor
                  cursorStyle="|"
                  typeSpeed={120}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Replies */}
        <div className="flex flex-wrap gap-2 mb-2 mt-1">
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              className="px-3 py-1 text-sm rounded border border-neonPurple text-neonPurple
                         hover:bg-neonPurple hover:text-white transition-colors"
              onClick={() => handleQuickReply(qr)}
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3 py-2 rounded text-sm bg-gray-800 text-white
                       focus:outline-none border border-gray-600"
            placeholder="Ask about Crustdata's APIs..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded bg-neonPink text-white hover:bg-white hover:text-neonPink
                       border border-neonPink transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * getBotResponse:
 *  1) Level 1 logic: If user requests screener/person/search with region => validate
 *  2) If not matched, search knowledge_base.json
 *  3) If not found, fallback to data.json
 */
function getBotResponse(question, conversation) {
  const lower = question.toLowerCase();

  // (1) LEVEL 1 AGENTIC CHECK: region
  if (lower.includes("screener/person/search") && lower.includes("region=")) {
    const regionRegex = /region\s*=\s*(.*)/i;
    const match = regionRegex.exec(question);
    if (match) {
      let regionRaw = match[1].trim();
      const regionList = regionData.regions;
      if (regionList.includes(regionRaw)) {
        // valid
        return buildValidRequest(regionRaw);
      } else {
        // invalid
        const errorLog = `Error: Region "${regionRaw}" not found in region_list.json.\nValid: ${regionList.join(
          ", "
        )}`;
        const fixed = attemptFix(regionRaw, regionList);
        const finalRegion = fixed || "United States";
        return (
          `Hmm, your region "${regionRaw}" is invalid.\n` +
          `Checking logs:\n${errorLog}\n\n` +
          (fixed
            ? `Auto-corrected to "${fixed}".`
            : `Could not fix, defaulting to "United States".`) +
          `\n\nHere is the corrected request:\n${buildValidRequest(finalRegion)}`
        );
      }
    }
  }

  // (2) LEVEL 2 KNOWLEDGE BASE CHECK
  const kbAnswer = searchKnowledgeBase(lower);
  if (kbAnswer) {
    return kbAnswer;
  }

  // (3) FALLBACK to data.json
  if (lower.includes("search for people")) {
    return data["search for people"];
  }
  if (lower.includes("region")) {
    return data["region"];
  }
  if (lower.includes("email") || lower.includes("enrichment")) {
    return data["email/enrichment"];
  }
  return data["fallback"];
}

/** Build a valid request */
function buildValidRequest(regionVal) {
  return `curl --location 'https://api.crustdata.com/screener/person/search' \\
--header 'Content-Type: application/json' \\
--header 'Authorization: Token $YOUR_TOKEN' \\
--data '{
  "filters": [
    {
      "filter_type": "CURRENT_COMPANY",
      "type": "in",
      "value": ["openai.com"]
    },
    {
      "filter_type": "CURRENT_TITLE",
      "type": "in",
      "value": ["engineer"]
    },
    {
      "filter_type": "REGION",
      "type": "in",
      "value": ["${regionVal}"]
    }
  ],
  "page": 1
}'`;
}

/** Attempt to fix region if user typed "San Fran" etc. */
function attemptFix(regionRaw, regionList) {
  if (regionRaw.toLowerCase().includes("san fran")) {
    const possible = "San Francisco, California, United States";
    if (regionList.includes(possible)) {
      return possible;
    }
  }
  return null;
}

/** 
 * searchKnowledgeBase:
 *  A naive approach: if user’s question has keywords that appear in kb.question,
 *  we return kb.answer. In real usage, do fuzzy or embedding-based search.
 */
function searchKnowledgeBase(userLower) {
  for (const entry of knowledgeBase.kb) {
    // We'll just check if "some" words from entry.question appear in userLower
    // This is very naive. Real solutions might do advanced semantic search.
    const questionWords = entry.question.toLowerCase().split(/\s+/);
    let matchCount = 0;
    for (const w of questionWords) {
      if (w.length > 3 && userLower.includes(w)) {
        matchCount++;
      }
    }
    // if matchCount is above some threshold, we say it's relevant
    if (matchCount > 2) {
      return entry.answer;
    }
  }
  return null;
}
