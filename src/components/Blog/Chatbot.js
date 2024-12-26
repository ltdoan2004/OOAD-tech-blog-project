'use client';
import React, { useState } from 'react';
import { OpenAI } from 'openai';

const Chatbot = ({ blogContent }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Change REACT_APP_ to NEXT_PUBLIC_
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

    setMessages([...messages, { sender: 'user', text: input }]);
    setLoading(true);

    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `User question: ${input}\n\nBlog content: ${blogContent}` },
        ],
        max_tokens: 150,
      });

      const answer = response.data.choices[0].message.content.trim();
      setMessages((prev) => [...prev, { sender: 'bot', text: answer }]);
    } catch (error) {
      console.error('Error with OpenAI API:', error);
      let errorMessage = 'Sorry, something went wrong!';
      if (error.response && error.response.status === 401) {
        errorMessage = 'Authentication failed. Check your API key.';
      } else if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please try again later.';
      }
      setMessages((prev) => [...prev, { sender: 'bot', text: errorMessage }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '2rem' }}>
      <div id="chat-container" style={{ height: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '0.5rem 0',
            }}
          >
            <strong>{msg.sender === 'user' ? 'You' : 'Chatbot'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <div style={{ textAlign: 'left' }}>Chatbot is typing...</div>}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something..."
          style={{ flexGrow: 1, padding: '0.5rem' }}
        />
        <button onClick={handleSend} style={{ padding: '0.5rem 1rem' }} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;