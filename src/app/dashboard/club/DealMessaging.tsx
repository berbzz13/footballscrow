"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, Send, ChevronDown, ChevronUp } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string | Date;
  sender: { id: string; name: string; role: string };
}

interface Deal {
  id: string;
  messages: Message[];
}

export default function DealMessaging({
  deal,
  currentUserId,
}: {
  deal: Deal;
  currentUserId: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    setMessage("");
    setSending(false);
    router.refresh();
  }

  return (
    <div className="border-t border-gray-100 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
      >
        <MessageCircle size={14} />
        {deal.messages.length} message{deal.messages.length !== 1 ? "s" : ""} from escrow team
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {deal.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2.5 rounded-lg text-xs ${
                  msg.isAdmin
                    ? "bg-blue-50 border border-blue-100"
                    : msg.sender.id === currentUserId
                    ? "bg-gray-100 ml-4"
                    : "bg-green-50 border border-green-100"
                }`}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-semibold text-gray-700">
                    {msg.isAdmin ? "🔒 FootballScrow Team" : msg.sender.name}
                  </span>
                  <span className="text-gray-400">· {formatTimeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-gray-700">{msg.content}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Message our escrow team..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-xs text-gray-400">All messages go through our escrow team. No direct contact with talents.</p>
        </div>
      )}
    </div>
  );
}
