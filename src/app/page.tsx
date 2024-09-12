"use client"

import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Your NestJS backend

interface Message {
  user: string;
  text: string;
  timestamp: string;
}


export default function Chat() {
  // Explicitly set messages to be an array of strings
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Listen for messages from the server
    socket.on('message', (data: string) => {
      setMessages((prev) => [...prev, data]); // TypeScript knows this is an array of strings
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('message', message); // Send message to the server
      setMessage('');
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
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
