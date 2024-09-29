"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChatRoom from '../chatroom/ChatRoom';



export default function Home() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    setUserId(storedUserId);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {userId ? (
        <ChatRoom />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <Link href="/auth/signin" className="text-blue-500 underline">
            Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
