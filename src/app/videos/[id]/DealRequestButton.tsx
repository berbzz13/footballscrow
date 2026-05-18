"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Handshake, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/utils";

interface Props {
  videoId: string;
  talentId: string;
  talentName: string;
  isInterested: boolean;
  existingDealId?: string;
  existingDealStatus?: string;
}

export default function DealRequestButton({
  videoId,
  talentId,
  talentName,
  isInterested: initialInterested,
  existingDealId,
  existingDealStatus,
}: Props) {
  const router = useRouter();
  const [interested, setInterested] = useState(initialInterested);
  const [showDealForm, setShowDealForm] = useState(false);
  const [dealType, setDealType] = useState("transfer");
  const [proposedFee, setProposedFee] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [dealCreated, setDealCreated] = useState(!!existingDealId);
  const [dealStatus, setDealStatus] = useState(existingDealStatus || "");

  async function handleInterest() {
    await fetch("/api/interests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    setInterested(true);
  }

  async function handleDealRequest() {
    setLoading(true);
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ talentId, videoId, dealType, proposedFee, note }),
    });
    if (res.ok) {
      setDealCreated(true);
      setDealStatus("pending");
      setShowDealForm(false);
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
      <h3 className="font-semibold text-gray-900 text-sm">Take Action</h3>

      {!interested ? (
        <Button variant="outline" className="w-full" onClick={handleInterest}>
          <Heart size={16} /> Show Interest
        </Button>
      ) : (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle size={16} /> Added to your shortlist
        </div>
      )}

      {dealCreated ? (
        <div className="space-y-2">
          <div className={`text-xs px-3 py-1.5 rounded-full font-medium w-fit ${DEAL_STATUS_COLORS[dealStatus]}`}>
            Deal: {DEAL_STATUS_LABELS[dealStatus] || dealStatus}
          </div>
          <p className="text-xs text-gray-500">
            Our team is facilitating this deal. Check your dashboard for updates.
          </p>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/club")}>
            View in Dashboard →
          </Button>
        </div>
      ) : (
        <>
          {!showDealForm ? (
            <Button className="w-full" onClick={() => setShowDealForm(true)}>
              <Handshake size={16} /> Request Deal via Escrow
            </Button>
          ) : (
            <div className="space-y-3 border border-green-200 rounded-xl p-4 bg-green-50">
              <h4 className="text-sm font-semibold text-green-800">Request deal for {talentName}</h4>
              <select
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={dealType}
                onChange={(e) => setDealType(e.target.value)}
              >
                <option value="transfer">Transfer</option>
                <option value="loan">Loan</option>
                <option value="trial">Trial</option>
              </select>
              <input
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                placeholder="Proposed fee (optional)"
                value={proposedFee}
                onChange={(e) => setProposedFee(e.target.value)}
              />
              <textarea
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                placeholder="Additional notes for our escrow team..."
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <Button size="sm" loading={loading} onClick={handleDealRequest} className="flex-1">
                  Submit Request
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowDealForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
