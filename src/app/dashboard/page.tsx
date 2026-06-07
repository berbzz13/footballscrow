"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldAlert, Send, Lock } from "lucide-react";

type User = {
  id: string;
  name: string;
  role: string;
  uniqueId: string;
};

type Message = {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  sender: User;
  receiver: User;
};

export default function SecureInbox() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  
  // Admin-specific state for managing multiple conversations
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Authenticate and enforce RBAC on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          window.location.href = "/login";
          return;
        }
        setCurrentUser(d.user);
        
        // Strict Authorization Block: Agents & Clubs cannot access Direct Messages
        if (d.user.role === "agent" || d.user.role === "club") {
          setLoading(false);
          return; // The UI will render the access denied screen
        }
        
        fetchMessages();
      })
      .catch(() => setError("Authentication failed"));
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChatUserId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setSending(true);
    setError("");

    try {
      // If Admin, send to the selected user. If Talent/Academy, backend forces receiver to Admin.
      const receiverId = currentUser.role === "admin" ? selectedChatUserId : "admin-placeholder";

      if (currentUser.role === "admin" && !receiverId) {
        throw new Error("Please select a conversation first.");
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, content: newMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      fetchMessages(); // Refresh chat
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  // Render: Access Denied State (Fail-Closed)
  if (currentUser && (currentUser.role === "agent" || currentUser.role === "club")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert size={64} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
        <p className="text-gray-600 max-w-md">
          Agents and Clubs are strictly prohibited from utilizing direct messaging outside of active Deal requests to protect Talent privacy.
        </p>
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Decrypting channel...</div>;

  // Render: Admin Split View vs User Single View
  const isAdmin = currentUser?.role === "admin";

  // Group messages by the "other" user for the Admin sidebar
  const contacts = isAdmin ? Array.from(new Set(
    messages.map(m => m.senderId === currentUser.id ? m.receiverId : m.senderId)
  )).map(id => {
    const msg = messages.find(m => m.senderId === id || m.receiverId === id);
    return msg?.senderId === id ? msg?.sender : msg?.receiver;
  }) : [];

  // Filter messages for the active chat window
  const activeMessages = isAdmin 
    ? messages.filter(m => m.senderId === selectedChatUserId || m.receiverId === selectedChatUserId)
    : messages;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 h-[85vh] flex flex-col">
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <Lock size={20} className="text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Secure Comm Channel</h1>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</div>}

      <div className="flex flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Sidebar: Only visible to Admin */}
        {isAdmin && (
          <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-4 border-b font-semibold text-gray-700 text-sm">Active Connections</div>
            <div className="flex-1 overflow-y-auto">
              {contacts.map((contact) => contact && (
                <button
                  key={contact.id}
                  onClick={() => setSelectedChatUserId(contact.id)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedChatUserId === contact.id ? "bg-white border-l-4 border-l-green-500" : "hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium text-gray-900">{contact.name}</div>
                  <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{contact.role} | ID: {contact.uniqueId}</div>
                </button>
              ))}
              {contacts.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">No active conversations.</div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          {isAdmin && !selectedChatUserId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select a secure connection to view messages
            </div>
          ) : (
            <>
              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="text-center text-gray-400 mt-10 text-sm">
                    {isAdmin ? "No messages yet." : "This is a secure channel direct to the Platform Admin. Messages are end-to-end encrypted."}
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                          isMe ? "bg-green-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 mx-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Transmit message..."
                    className="flex-1"
                    required
                  />
                  <Button type="submit" loading={sending} disabled={sending || !newMessage.trim()} className="px-6">
                    <Send size={16} className={sending ? "hidden" : "mr-2"} />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
