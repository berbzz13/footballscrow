"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUserActions({ userId, verified }: { userId: string; verified: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleVerify() {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, verified: !verified }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggleVerify}
      disabled={loading}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
        verified
          ? "bg-red-50 text-red-600 hover:bg-red-100"
          : "bg-green-50 text-green-600 hover:bg-green-100"
      }`}
    >
      {verified ? "Unverify" : "Verify"}
    </button>
  );
}
