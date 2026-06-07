"use client";
import { useEffect, useState, useCallback } from "react";
import VideoCard from "@/components/VideoCard";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Search, SlidersHorizontal } from "lucide-react";
import { POSITIONS } from "@/lib/utils";

export default function TalentsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  // Privacy Rule: Removed nationality/location state
  
  const [shortlist, setShortlist] = useState<Record<string, boolean>>({});
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUserRole(d.user.role);
      })
      .catch(() => {});
  }, []);

  // Fetch the Shortlist instead of "Interests"
  useEffect(() => {
    if (userRole === "club" || userRole === "agent") {
      fetch("/api/shortlists")
        .then((r) => r.json())
        .then((d) => {
          if (d.shortlists) {
            const map: Record<string, boolean> = {};
            d.shortlists.forEach((i: any) => { map[i.videoId] = true; });
            setShortlist(map);
          }
        });
    }
  }, [userRole]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "12",
      ...(search && { search }), // This will now search by uniqueId on the backend
      ...(position && { position }),
    });
    const res = await fetch(`/api/videos?${params}`);
    const data = await res.json();
    setVideos(data.videos || []);
    setTotal(data.total || 0);
    setPages(data.pages || 1);
    setLoading(false);
  }, [page, search, position]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle adding to Shortlist
  async function handleShortlist(videoId: string) {
    if (!userRole || (userRole !== "club" && userRole !== "agent")) {
      window.location.href = "/login";
      return;
    }
    await fetch("/api/shortlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    setShortlist((prev) => ({ ...prev, [videoId]: true }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Browse Talent Pool</h1>
        <p className="text-gray-500 mt-1">
          {total} talent video{total !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Filters - Stripped of Location Data */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-2 text-gray-500 shrink-0">
          <SlidersHorizontal size={18} />
          <span className="text-sm font-medium">Filters</span>
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search by Unique ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <Select
            options={POSITIONS.map((p) => ({ value: p, label: p }))}
            placeholder="All Positions"
            value={position}
            onChange={(e) => { setPosition(e.target.value); setPage(1); }}
          />
        </div>
        {(search || position) && (
          <button
            onClick={() => { setSearch(""); setPosition(""); setPage(1); }}
            className="text-sm text-red-500 hover:text-red-700 shrink-0 whitespace-nowrap"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚽</div>
          <h3 className="text-lg font-semibold text-gray-900">No videos found</h3>
          <p className="text-gray-500 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={{ ...video, createdAt: video.createdAt }}
              showInterestBtn={userRole === "club" || userRole === "agent"}
              onInterest={handleShortlist}
              isInterested={shortlist[video.id]}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pages}</span>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
