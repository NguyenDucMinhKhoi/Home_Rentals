import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatWidget.scss'; 

const API_BASE_URL = 'http://localhost:3001';

export default function ChatWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sessionId = useRef(localStorage.getItem('df_session') || '');
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage = { from: 'user', text: input };
    setMessages(msgs => [...msgs, userMessage]);
    setIsLoading(true);

    try {
      console.log('📤 Sending message to server:', input);
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ 
          message: input, 
          sessionId: sessionId.current 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('❌ Server error:', errorData);
        throw new Error(`HTTP error! status: ${res.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await res.json();
      console.log('📥 Received response:', data);
      
      if (data.sessionId && !sessionId.current) {
        sessionId.current = data.sessionId;
        localStorage.setItem('df_session', data.sessionId);
      }

      const botMessage = { 
        from: 'bot', 
        text: data.reply || 'Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn được không?' 
      };
      setMessages(msgs => [...msgs, botMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = { 
        from: 'bot', 
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.' 
      };
      setMessages(msgs => [...msgs, errorMessage]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className={`chat-widget ${isOpen ? '' : 'closed'}`}>
      <div className="chat-header">
        <span>Chat Support</span>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '✕' : '✖'}
        </button>
      </div>
      {isOpen && (
        <div className="chat-body">
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.from}`}>
              {m.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      {isOpen && (
        <div className="chat-input">
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '...' : 'Gửi'}
          </button>
        </div>
      )}
    </div>
  );
}
