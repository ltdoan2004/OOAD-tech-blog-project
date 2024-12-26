'use client';
import React, { useState } from 'react';
import { OpenAI } from 'openai';

const Chatbot = ({ blogContent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing NEXT_PUBLIC_OPENAI_API_KEY');
  }

  const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true
  });
  console.log('blogContent:', blogContent);
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

  return (
    <div className="border border-dark/10 dark:border-light/10 rounded-lg p-4 mt-8">
      <div className="h-80 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.sender === 'user' ? 'text-right' : 'text-left'
            } ${msg.error ? 'text-red-500' : ''}`}
          >
            <span className="font-semibold">
              {msg.sender === 'user' ? 'You: ' : 'AI: '}
            </span>
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="text-left text-dark/50 dark:text-light/50">
            AI is thinking...
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about this blog post..."
          className="flex-1 p-2 border border-dark/10 dark:border-light/10 rounded"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-4 py-2 bg-dark dark:bg-light text-light dark:text-dark rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;