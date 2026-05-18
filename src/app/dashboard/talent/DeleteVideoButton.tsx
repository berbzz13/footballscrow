"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function handleDelete() {
    await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button onClick={handleDelete} className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded bg-red-50">
          Yes
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-50">
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
    >
      <Trash2 size={15} />
    </button>
  );
}
