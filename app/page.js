"use client"; // enable client-side interactions
import { useState } from "react";
import data from "./data.json";

export default function HomePage() {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState("");

  function getBotResponse(question) {
    // Hardcoded Q&A logic for Level 0
    const lowerQ = question.toLowerCase();

    if (lowerQ.includes("search for people")) {
      return data["search for people"];
    }
    if (lowerQ.includes("region")) {
      return data["region"];
    }

    // Fallback
    return data["fallback"];
  }

  function handleSend() {
    if (!inputVal.trim()) return;

    // 1) User message
    const userMsg = { sender: "user", text: inputVal };
    // 2) Bot response
    const botMsg = { sender: "bot", text: getBotResponse(inputVal) };

    // Update message array
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputVal("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleSend();
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: "30px auto", padding: 16 }}>
      <h1>Crustdata Support - Level 0 (App Router)</h1>
      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          marginBottom: 12,
          padding: 8,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.sender === "user" ? "right" : "left",
              margin: "6px 0",
            }}
          >
            <strong>{m.sender}:</strong> {m.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          placeholder="Ask about Crustdata's APIs..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </main>
  );
}
