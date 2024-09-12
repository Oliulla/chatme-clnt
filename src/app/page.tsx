"use client"

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

export default function Chat() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);

  useEffect(() => {
    socket.on('message', (data: string) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('typing', (data: { username: string }) => {
      setIsTyping(`...`);
    });

    socket.on('stopTyping', () => {
      setIsTyping(null);
    });

    return () => {
      socket.off('message');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit('typing', { username: 'User1' });
    }

    setTimeout(() => {
      setTyping(false);
      socket.emit('stopTyping', { username: 'User1' });
    }, 3000);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', message);
      setMessage('');
      socket.emit('stopTyping', { username: 'User1' });
    }
  };

  return (
    <div>
      <h1>Chat Room</h1>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>

      {isTyping && <p>{isTyping}</p>}

      <input
        type="text"
        value={message}
        onChange={handleTyping}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
