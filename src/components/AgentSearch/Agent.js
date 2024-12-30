"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { extractLinks, removeLinks } from './utils';

const Agent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', sender: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong');
      }

      const data = await response.json();
      const botMessage = {
        role: 'bot',
        sender: 'bot',
        content: removeLinks(data.response),
        links: extractLinks(data.response),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [...prev, { role: 'bot', sender: 'bot', content: 'Server error: Please check if backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  const formatMessageWithLinks = (message) => {
    return (
      <p>{message.content}</p>
    );
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel for Chat History */}
      <div className="w-[15%] bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-sm font-bold mb-4">Chat History</h2>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx} className="mb-2 text-xs text-gray-700">
              {msg.role === 'user' ? 'You: ' : 'Bot: '}
              {msg.content.slice(0, 30)}...
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className="w-[1px] bg-gray-300"></div>
      {/* Right Panel for Chat Interface */}
      <div className="w-[90%] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message, index) => {
            const isBot = message.sender === 'bot';

            return (
              <div
                key={index}
                className={`mb-2 p-3 rounded-lg max-w-[80%] ${
                  isBot
                    ? 'bg-purple-400 dark:bg-yellow-400 text-dark dark:text-light' 
                    : 'bg-purple-400 dark:bg-yellow-400 text-dark dark:text-light ml-auto'
                }`}
                style={{ clear: 'both' }}
              >
                <div
                  className={`flex items-start gap-2 ${
                    isBot ? '' : 'flex-row-reverse text-right'
                  }`}
                >
                  <Image
                    src={isBot ? '/bot_chat.webp' : '/user_chat.webp'}
                    alt={`${message.sender} avatar`}
                    width={24}
                    height={24}
                    className="rounded-full mt-1"
                  />
                  <div>
                    <div className="font-semibold mb-1">
                      {isBot ? 'AI Assistant' : 'You'}:
                    </div>
                    {formatMessageWithLinks(message)}
                  </div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="animate-pulse text-gray-500">
              Techbot thinking...
            </div>
          )}
          {error && <div className="text-red-500">Error: {error}</div>}
        </div>

        {/* Input Section */}
        <div className="mt-2 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className={`flex-1 p-2 rounded-lg border transition-colors duration-200 bg-dark dark:bg-light text-light dark:text-dark border-light/10 focus:ring-2 focus:ring-primary focus:outline-none`}
              placeholder="Ask about the blog content..."
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className={`px-4 py-2 rounded transition-colors duration-200 bg-purple-600 dark:bg-yellow-500 text-light hover:bg-orange-600`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Agent;
