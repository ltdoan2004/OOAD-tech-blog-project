'use client';
import React, { useState } from 'react';
import { OpenAI } from 'openai';
import { FiMessageCircle } from 'react-icons/fi';
import Image from 'next/image';
import { useThemeSwitch } from '../Hooks/useThemeSwitch';
const Chatbot = ({ blogContent, blogUrl }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useThemeSwitch();
  const [dimensions, setDimensions] = useState({
    width: '45%',
    height: '50vh'
  });
  
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
          {
            role: 'system',
            content: `You are a helpful assistant focused on web development topics. When answering questions, reference relevant blog posts and provide their URLs if available. Only reference content from the provided blog content. Format responses with markdown and include links using [title](url) syntax. Current blog URL: ${blogUrl}`
          },
          {
            role: 'user',
            content: `Question: ${input}\n\nAvailable blog content: ${blogContent}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const answer = response.choices[0].message.content.trim();
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: answer,
        links:
          answer.match(/\[([^\]]+)\]\(([^)]+)\)/g)?.map(link => {
            const [, title, url] = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
            return { title, url };
          }) || []
      }]);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const formatMessageWithLinks = (message) => {
    if (!message.links?.length) return message.text;

    let formattedText = message.text;
    message.links.forEach(link => {
      const regex = new RegExp(`\\[${link.title}\\]\\(${link.url}\\)`, 'g');
      formattedText = formattedText.replace(
        regex,
        `<a href="${link.url}" class="text-blue-600 hover:underline" target="_blank">${link.title}</a>`
      );
    });
    return <div dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  // Kéo-thả góc dưới-phải
  const handleMouseDownBottomRight = (e) => {
    e.preventDefault();
    const chatBox = e.target.parentElement;
    const startWidth = parseInt(window.getComputedStyle(chatBox).width, 10);
    const startHeight = parseInt(window.getComputedStyle(chatBox).height, 10);
    const startX = e.clientX;
    const startY = e.clientY;

    const onMouseMove = (ev) => {
      const newWidth = startWidth + (ev.clientX - startX);
      const newHeight = startHeight + (ev.clientY - startY);

      if (newWidth > 300) {
        chatBox.style.width = newWidth + 'px';
      }
      if (newHeight > 200) {
        chatBox.style.height = newHeight + 'px';
      }

      setDimensions({
        width: chatBox.style.width,
        height: chatBox.style.height
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Kéo-thả góc trên-phải
  const handleMouseDownTopRight = (e) => {
    e.preventDefault();
    const chatBox = e.target.parentElement;
    const startHeight = parseInt(window.getComputedStyle(chatBox).height, 10);
    const startY = e.clientY;

    const onMouseMove = (ev) => {
      const diff = startY - ev.clientY;
      const newHeight = startHeight + diff;

      if (newHeight > 200) {
        chatBox.style.height = newHeight + 'px';
      }

      setDimensions((prev) => ({
        ...prev,
        height: chatBox.style.height
      }));
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Nút mở/đóng chatbot */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="w-12 h-12 bg-yellow-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-yellow-600 focus:outline-none"
      >
        <FiMessageCircle size={24} />
      </button>

      {isVisible && (
        <div
          className="fixed bottom-16 left-4 bg-light dark:bg-dark rounded-lg shadow-xl"
          style={{
            width: dimensions.width,
            height: dimensions.height,
            minWidth: '300px',
            minHeight: '200px',
            maxWidth: '800px',
            maxHeight: '80vh',
            resize: 'none',
            overflow: 'hidden'
          }}
        >
          <div className="h-full flex flex-col p-4">
            <div className="flex-1 overflow-y-auto">
              {messages.map((message, index) => {
                const isBot = message.sender === 'bot';


                return (
                  <div
                    key={index}
                    className={`mb-2 p-3 rounded-lg max-w-[80%] ${
                      isBot
                        ? 'bg-purple-600 dark:bg-yellow-400 text-dark dark:text-light' 
                        : 'bg-purple-600 dark:bg-yellow-400 text-dark dark:text-light ml-auto'
                      /* 
                        - ml-auto: đẩy khung của user sang phải 
                        - Hoặc bạn dùng flex + justify-end cũng được 
                      */
                    }`}
                    style={{ clear: 'both' }}
                  >
                    {/* Nếu muốn avatar hiển thị trái/phải khác nhau thì dùng flex-row / flex-row-reverse */}
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

            {/* Khu vực input ở dưới */}
            <div className="mt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className={`flex-1 p-2 rounded-lg border transition-colors duration-200 bg-dark dark:bg-light text-light dark:text-dark border-light/10 focus:ring-2 focus:ring-primary focus:outline-none`}
                  placeholder="Ask about the blog content..."
                />
                <button
                  onClick={handleSend}
                  disabled={loading}
                  className={`px-4 py-2 rounded transition-colors duration-200 bg-purple-600 dark:bg-yellow-500 text-light hover:bg-orange-600`}>
                  Send
                </button>
              </div>
            </div>
          </div>

          {/* Tay nắm góc dưới-phải */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-200 hover:bg-yellow-500 rounded-bl"
            onMouseDown={handleMouseDownBottomRight}
          />
          {/* Tay nắm góc trên-phải */}
          <div
            className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize bg-gray-200 hover:bg-yellow-500 rounded-bl"
            onMouseDown={handleMouseDownTopRight}
          />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
