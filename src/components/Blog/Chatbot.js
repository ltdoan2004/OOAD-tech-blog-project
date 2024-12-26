'use client';
import React, { useState } from 'react';
import { OpenAI } from 'openai';
import { FiMessageCircle } from 'react-icons/fi';
import Image from 'next/image';

const Chatbot = ({ blogContent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    setLoading(true);
    setError(null);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Question about the blog: ${input}\n\nBlog content: ${blogContent}` }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const answer = response.choices[0].message.content.trim();
      setMessages(prev => [...prev, { sender: 'bot', text: answer }]);

    } catch (err) {
      console.error('Error with OpenAI API:', err);
      setError(err.message);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-12 h-12 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-yellow-600 focus:outline-none transition-transform transform duration-300"
        style={{ zIndex: 100 }}
      >
        <FiMessageCircle size={24} />
      </button>

      {isVisible && (
        <div
          className="fixed bottom-16 left-4 w-[45%] max-w-2xl bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white rounded-lg shadow-lg overflow-hidden transition-transform transform duration-500"
          style={{ zIndex: 99 }}
        >
          <div className="p-4 flex flex-col">
            <div className="max-h-[50vh] overflow-y-auto mb-4 scroll-smooth">
              {messages.map((message, index) => (
                <div key={index} 
                  className={`mb-2 p-3 rounded-md text-sm shadow-md w-full flex items-center gap-2 ${
                    message.sender === 'bot' 
                      ? 'bg-orange-200 text-orange-800 text-left flex-row' 
                      : 'bg-gray-100 text-black text-right flex-row-reverse'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <Image 
                      src="/bot_chat.webp" 
                      alt="Bot Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full" 
                    />
                  ) : (
                    <Image 
                      src="/user_chat.webp" 
                      alt="User Avatar" 
                      width={32} 
                      height={32} 
                      className="rounded-full" 
                    />
                  )}
                  <div>
                    <strong>{message.sender === 'bot' ? 'Techbot: ' : 'You: '}</strong>
                    <p className="text-black">{message.text}</p>
                  </div>
                </div>
              ))}
              {loading && <div className="animate-pulse text-gray-500">Techbot is thinking...</div>}
              {error && <div className="text-red-500">{error}</div>}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-3 border rounded bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Ask about the article..."
              />
              <button 
                onClick={handleSend}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                disabled={loading}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
