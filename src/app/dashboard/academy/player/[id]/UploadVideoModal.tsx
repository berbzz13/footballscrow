"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Video } from "lucide-react";

export default function UploadVideoModal({ playerId }: { playerId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Package the form data, including the actual files
    const formData = new FormData(e.currentTarget);
    formData.append("playerId", playerId); // Crucial: Tell the server WHICH player this is for

    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        body: formData, // Sending as multipart/form-data for files
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to upload video");
      }

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
      >
        <span>+</span> Upload Highlight
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-green-100 p-2 rounded-lg">
                <Video size={20} className="text-green-700" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Upload Video File</h2>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase text-xs">
                  Video Title
                </label>
                <Input required name="title" placeholder="e.g. 2025 Midfield Highlights" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase text-xs">
                  Video File (.mp4)
                </label>
                <input 
                  required 
                  type="file" 
                  name="video" 
                  accept="video/*" 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 border border-gray-300 rounded-lg p-2"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="bg-green-600 hover:bg-green-700 text-white">
                  Upload & Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
