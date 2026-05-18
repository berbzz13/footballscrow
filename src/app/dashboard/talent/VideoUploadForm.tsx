"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Upload, CheckCircle } from "lucide-react";

export default function VideoUploadForm() {
  const router = useRouter();
  const videoRef = useRef<HTMLInputElement>(null);
  const thumbRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!videoFile) { setError("Please select a video file"); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("video", videoFile);
    if (thumbFile) formData.append("thumbnail", thumbFile);

    try {
      const res = await fetch("/api/videos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
      } else {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setTags("");
        setVideoFile(null);
        setThumbFile(null);
        if (videoRef.current) videoRef.current.value = "";
        if (thumbRef.current) thumbRef.current.value = "";
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Video Title"
        id="title"
        placeholder="e.g. Striker Highlights - March 2025"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          rows={3}
          placeholder="Tell scouts about this video..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Input
        label="Tags (comma-separated)"
        id="tags"
        placeholder="e.g. skills, dribbling, goals, 2025"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Video File *</label>
        <div
          className="border-2 border-dashed border-gray-300 hover:border-green-400 rounded-xl p-6 text-center cursor-pointer transition-colors"
          onClick={() => videoRef.current?.click()}
        >
          {videoFile ? (
            <div className="text-green-600 font-medium text-sm">
              <CheckCircle size={20} className="mx-auto mb-1" />
              {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
            </div>
          ) : (
            <>
              <Upload size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Click to select video (MP4, MOV, AVI)</p>
              <p className="text-xs text-gray-400 mt-1">Max 500MB</p>
            </>
          )}
          <input
            ref={videoRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image (optional)</label>
        <input
          ref={thumbRef}
          type="file"
          accept="image/*"
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} /> Video uploaded successfully!
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Upload Video
      </Button>
    </form>
  );
}
