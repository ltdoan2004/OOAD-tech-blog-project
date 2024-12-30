"use client";
import React, { useState } from "react";
import Image from "next/image";
import { extractLinks, removeLinks } from "./utils";

// DotLottie
import { DotLottiePlayer } from "@dotlottie/react-player";
import "@dotlottie/react-player/dist/index.css";

const Agent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", sender: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      const data = await response.json();
      const botMessage = {
        role: "bot",
        sender: "bot",
        content: removeLinks(data.response),
        links: extractLinks(data.response),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          sender: "bot",
          content: "Server error: Please check if backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageWithLinks = (message) => {
    return (
      <div>
        <p className="mb-2">{message.content}</p>
        {message.links && message.links.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-600">
            <p className="text-sm font-medium mb-1">Related Articles:</p>
            <ul className="space-y-1">
              {message.links.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-sm dark:text-dark text-white hover:text-blue-400 hover:underline underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.title || link.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex w-screen min-h-screen dark:bg-black bg-white dark:text-white text-black">
      {/* 
        Cột bên trái: 
        - Animation nhỏ
        - Dòng chữ “Tech bot” to & cách điệu
      */}
      <div className="w-1/3 h-full py-20 flex flex-col items-center justify-center p-2">
        <DotLottiePlayer
          src="/animation_llqd7ey4.lottie"
          autoplay
          loop
          style={{ width: "50%", height: "50%" }}
        />
        <h2 className="mt-4 text-4xl font-extrabold italic tracking-wide">
          Tech bot
        </h2>
      </div>

      {/* Đường kẻ chia cột, dày 4px */}
      <div className="w-[4px] bg-gray-700" />

      {/* 
        Cột bên phải: Chat to hơn (chiều ngang rộng), 
        sát đường kẻ hơn (pl-2), 
        h vẫn 80vh. 
      */}
      <div className="flex-1 flex items-center justify-start pl-0 pr-4 ">
        <div
          className="w-[95%] h-[80vh] flex flex-col
                     border-2 border-gray-600 
                     bg-gray-900 text-white
                     rounded-md shadow-lg"
        >
          {/* Danh sách tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 bg-purple-100 dark:bg-yellow-100">
            {messages.map((message, index) => {
              const isBot = message.sender === "bot";
              return (
                <div
                  key={index}
                  className={`
                    mb-3 max-w-[70%] p-3 rounded 
                    ${
                      isBot
                        ? "bg-purple-400 dark:bg-yellow-400 text-dark dark:text-light"
                        : "bg-purple-400 dark:bg-yellow-400 text-dark dark:text-light ml-auto"
                    }
                  `}
                  style={{ clear: "both" }}
                >
                  <div
                    className={`flex items-start gap-2 ${
                      isBot ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <Image
                      src={isBot ? "/bot_chat.webp" : "/user_chat.webp"}
                      alt={`${message.sender} avatar`}
                      width={24}
                      height={24}
                      className="rounded-full mt-1"
                    />
                    <div>
                      <div className="font-semibold mb-1">
                        {isBot ? "AI Assistant" : "You"}:
                      </div>
                      {formatMessageWithLinks(message)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input + Nút Send */}
          <div className="p-4 border-t border-gray-700 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message here..."
              className="flex-1 p-2 rounded 
                         border border-gray-600 bg-black text-white
                         focus:outline-none focus:border-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 rounded bg-purple-400 dark:bg-yellow-400 text-white dark:text-dark font-semibold
                         hover:bg-yellow-400 active:bg-yellow-600"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;
