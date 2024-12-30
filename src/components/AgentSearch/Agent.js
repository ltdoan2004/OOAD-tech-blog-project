"use client";
import React, { useState } from 'react';

const Agent = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
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
        const error = await response.json();
        throw new Error(error.detail || 'Something went wrong');
      }

      const data = await response.json();
      const botMessage = {
        role: 'bot',
        content: removeLinks(data.response), // Remove links from the response content
        links: extractLinks(data.response), // Extract links separately
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: 'bot',
        content: 'Server error: Please check if backend is running.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const extractLinks = (text) => {
    const linkRegex = /-\s(.+?)\((\/[^)]+)\)/g;
    const links = [];
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      links.push({ title: match[1], url: match[2] });
    }
    return links;
  };

  const removeLinks = (text) => {
    return text.replace(/-\s(.+?)\((\/[^)]+)\)/g, '').trim();
  };

  const renderLinks = (links) => {
    if (!links || links.length === 0) return null;

    return (
      <div className="mt-2">
        <h4 className="text-sm font-bold">Relevant Links:</h4>
        <ul className="list-disc list-inside">
          {links.map((link, idx) => (
            <li key={idx}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Chat with TechBot</h2>
        </div>

        <div className="h-96 overflow-y-auto p-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 ${
                msg.role === 'user' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{msg.content}</p>
                {msg.role === 'bot' && renderLinks(msg.links)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-500 text-center">
              Processing your message...
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
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
