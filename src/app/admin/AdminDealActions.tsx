"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS, formatTimeAgo } from "@/lib/utils";

interface Deal {
  id: string;
  status: string;
  dealType?: string | null;
  proposedFee?: string | null;
  adminNotes?: string | null;
  createdAt: string | Date;
  talent: { id: string; name: string; talentProfile?: any };
  clubAgent: { id: string; name: string; role: string };
  video?: { id: string; title: string } | null;
  messages: Array<{
    id: string;
    content: string;
    isAdmin: boolean;
    createdAt: string | Date;
    sender: { id: string; name: string; role: string };
  }>;
}

const STATUSES = ["pending", "in_negotiation", "agreed", "completed", "rejected"];

export default function AdminDealActions({ deal, adminId }: { deal: Deal; adminId: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(deal.status === "pending");
  const [status, setStatus] = useState(deal.status);
  const [adminNotes, setAdminNotes] = useState(deal.adminNotes || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    await fetch(`/api/deals/${deal.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        adminNotes,
        ...(message.trim() && { message }),
      }),
    });
    setMessage("");
    setLoading(false);
    router.refresh();
  }

  return (
    <div className={`border rounded-xl p-4 ${deal.status === "pending" ? "border-yellow-300 bg-yellow-50/30" : "border-gray-200"}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900">{deal.talent.name}</span>
            <span className="text-gray-400">←→</span>
            <span className="font-semibold text-gray-900">{deal.clubAgent.name}</span>
            <span className="text-xs text-gray-500 capitalize">({deal.clubAgent.role})</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
            {deal.video && <span>Re: {deal.video.title}</span>}
            {deal.dealType && <span className="capitalize bg-gray-100 px-1.5 py-0.5 rounded">{deal.dealType}</span>}
            {deal.proposedFee && <span>Fee: {deal.proposedFee}</span>}
            <span>{formatTimeAgo(deal.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEAL_STATUS_COLORS[deal.status]}`}>
            {DEAL_STATUS_LABELS[deal.status]}
          </span>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Messages */}
          {deal.messages.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {deal.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2.5 rounded-lg text-xs ${
                    msg.isAdmin ? "bg-blue-50 border border-blue-100" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-semibold">{msg.isAdmin ? "🔒 You (Admin)" : msg.sender.name}</span>
                    <span className="text-gray-400">· {formatTimeAgo(msg.createdAt)}</span>
                  </div>
                  <p className="text-gray-700">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {/* Status Update */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Update Status</label>
              <select
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{DEAL_STATUS_LABELS[s] || s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notes</label>
              <input
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes..."
              />
            </div>
          </div>

          {/* Send Message */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Send Message to Parties (both talent & club/agent will see this)
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Type an update or request..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              >
                <Send size={14} />
                {loading ? "..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
