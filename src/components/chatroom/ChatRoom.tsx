"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";

export default function ChatRoom() {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [receiver, setReceiver] = useState<any>({
    id: "",
    name: "",
  });
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [supervisorId, setSupervisor] = useState("");
  const [role, setRole] = useState("");
  const router = useRouter();

  const socketRef = useRef<any>(null);

  const senderId = userId;

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

  const fetchMessages = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:4080/v1/chat/messages/${senderId}/${id}`
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

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:4080/chat");
    }

    const userId = localStorage.getItem("userId") || "User1";
    const username = localStorage.getItem("username") || "User1";
    const supervisorId = localStorage.getItem("supervisor") || "User1";
    const role = localStorage.getItem("role") || "CM";

    setUserId(userId);
    setUsername(username);
    setSupervisor(supervisorId);
    setRole(role);

    fetchUsers();
    fetchMessages(receiver?.id);

    socketRef.current.on("message", (data: any) => {
      setMessages((prev) => [...prev, data]);
    });

    socketRef.current.on("typing", (data: { username: string }) => {
      if (data.username !== username) {
        setIsTyping(`${data.username} is typing...`);
      }
    });

    socketRef.current.on("stopTyping", (data: { username: string }) => {
      if (data.username !== username) {
        setIsTyping(null);
      }
    });

    return () => {
      socketRef.current.off("message");
      socketRef.current.off("typing");
      socketRef.current.off("stopTyping");
    };
  }, [receiver?.id, userId, username]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socketRef.current.emit("typing", { username });
    }

    setTimeout(() => {
      setTyping(false);
      socketRef.current.emit("stopTyping", { username });
    }, 1000);
  };

  const sendMessage = () => {
    if (message.trim() && receiver.id) {
      socketRef.current.emit("message", {
        senderId: userId,
        receiverId: receiver.id,
        message: message.trim(),
      });
      setMessage("");
      socketRef.current.emit("stopTyping", { username });
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

  const handleReceiver = (id: string, username: string) => {
    setReceiver({
      name: username,
      id: id,
    });

    fetchMessages(id);
  };

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
                  onClick={() => handleReceiver(user._id, user?.username)}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div className="bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">Chat Room: ({username})</h1>
            <button
              onClick={handleLogout}
              className="mb-4 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
            >
              Logout, I am {role === "CM" ? "a" : "an"} {role}
            </button>

            {receiver?.id && <h3>You're chatting with: {receiver?.name}</h3>}

            <div className="w-full max-w-xl bg-white p-4 shadow-lg rounded-lg mb-4">
              <div className="h-64 overflow-y-scroll mb-4">
                {messages.map(({ message: msg, sender: senderId }, index) => (
                  <div
                    key={index}
                    className={`text-sm mb-1 flex ${
                      senderId === userId ? "justify-end" : "justify-start"
                    }`}
                  >
                    <p
                      className={`inline-block px-4 py-2 my-1 rounded-lg ${
                        senderId === userId
                          ? "bg-blue-500 text-white self-end mr-2 max-w-[75%]"
                          : "bg-green-500 text-white self-start max-w-[75%]"
                      }`}
                    >
                      {msg}
                    </p>
                  </div>
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
    </div>
  );
}
