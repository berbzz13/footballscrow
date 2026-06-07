"use client";
import Link from "next/link";
import { Eye, Bookmark } from "lucide-react";
import { formatTimeAgo } from "@/lib/utils";

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    description?: string | null;
    thumbnailUrl?: string | null;
    views: number;
    createdAt: string | Date;
    // Standalone Talent User
    talent?: {
      id: string;
      uniqueId: string;
      talentProfile?: {
        position?: string | null;
        age?: number | null;
      } | null;
    } | null;
    // Academy Managed Player
    player?: {
      id: string;
      uniqueId: string;
      position?: string | null;
      age?: number | null;
    } | null;
  };
  showInterestBtn?: boolean;
  onInterest?: (videoId: string) => void;
  isInterested?: boolean;
}

export default function VideoCard({ video, showInterestBtn, onInterest, isInterested }: VideoCardProps) {
  // Determine if the video belongs to a standalone Talent or an Academy's Player
  const isPlayer = !!video.player;
  const displayId = isPlayer ? video.player?.uniqueId : video.talent?.uniqueId;
  const targetLinkId = isPlayer ? video.player?.id : video.talent?.id;
  
  const position = isPlayer ? video.player?.position : video.talent?.talentProfile?.position;
  const age = isPlayer ? video.player?.age : video.talent?.talentProfile?.age;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <Link href={`/videos/${video.id}`} className="block relative aspect-video bg-gray-900 overflow-hidden">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">⚽</div>
              <p className="text-xs">No thumbnail</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Eye size={10} /> {video.views}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/videos/${video.id}`} className="font-semibold text-gray-900 hover:text-green-600 line-clamp-1 block mb-1">
          {video.title}
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700 shrink-0">
            {displayId ? displayId.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <Link href={`/talent/${targetLinkId}`} className="text-sm text-gray-700 hover:text-green-600 font-medium truncate block">
              ID: {displayId || "Unknown"}
            </Link>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              {position && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{position}</span>}
              {age && <span>{age}y</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{formatTimeAgo(video.createdAt)}</span>
          <div className="flex items-center gap-2">
            {showInterestBtn && (
              <button
                onClick={() => onInterest?.(video.id)}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  isInterested
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-700"
                }`}
              >
                <Bookmark size={12} className={isInterested ? "fill-green-600" : ""} />
                {isInterested ? "Shortlisted" : "Shortlist"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
