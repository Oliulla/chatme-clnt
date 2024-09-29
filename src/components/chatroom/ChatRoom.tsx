"use client";

import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

const socket = io("http://localhost:4080/chat");

export default function ChatRoom() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [receiver, setReceiver] = useState<any>({
    id: "",
    name: "",
  });

  const userId = localStorage.getItem("userId") || "User1";
  const username = localStorage.getItem("username") || "User1";
  const supervisorId = localStorage.getItem("supervisor") || "User1";
  const role = localStorage.getItem("role") || "CM";
  const router = useRouter();

  const senderId = userId;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(
          `http://localhost:4080/v1/auth/users?id=${userId}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUsers();

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:4080/v1/chat/messages/${senderId}/${receiver?.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error("Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    socket.on("message", (data: string) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("typing", (data: { username: string }) => {
      if (data.username !== username) {
        setIsTyping(`${data.username} is typing...`);
      }
    });

    socket.on("stopTyping", (data: { username: string }) => {
      if (data.username !== username) {
        setIsTyping(null);
      }
    });

    return () => {
      socket.off("message");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [username, userId, supervisorId, role]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", { username });
    }

    setTimeout(() => {
      setTyping(false);
      socket.emit("stopTyping", { username });
    }, 1000);
  };

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit("message", `${username}: ${message}`);
      setMessage("");
      socket.emit("stopTyping", { username });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("subordinates");
    localStorage.removeItem("supervisor");
    localStorage.removeItem("role");

    router.push("/auth/signin");
  };

  const handleReciver = (id: string, username: string) => {
    setReceiver({
      name: username,
      id: id,
    });
  };

  console.log(receiver, "rec");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex justify-between gap-x-16">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">
              {role === "MS" ? "All CMs" : "Your Supervisor"}
            </h2>
            <ul>
              {users.map((user) => (
                <li
                  key={user._id}
                  className="text-blue-600 cursor-pointer my-2"
                  onClick={() => handleReciver(user._id, user?.username)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className=" bg-gray-100">
          <h1 className="text-3xl font-bold mb-4">Chat Room</h1>
          <button
            onClick={handleLogout}
            className="mb-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            Logout, I am {role === "CM" ? "a" : "an"} {role}
          </button>

          <div className="w-full max-w-xl bg-white p-4 shadow-lg rounded-lg mb-4">
            <div className="h-64 overflow-y-scroll mb-4">
              {messages.map((msg, index) => (
                <p key={index} className="text-sm text-gray-800 mb-1">
                  {msg}
                </p>
              ))}
            </div>

            {isTyping && (
              <p className="text-sm text-gray-500 mb-2">{isTyping}</p>
            )}

            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 p-2 border rounded-lg border-gray-300 mr-2"
              />
              {receiver?.id && (
                <button
                  onClick={sendMessage}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  Send
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
