import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Video, User } from "lucide-react";
import UploadVideoModal from "./UploadVideoModal";

// 1. Notice the type of params changed to a Promise
export default async function AcademyPlayerProfile({ params }: { params: Promise<{ id: string }> }) {
  // 2. We now extract the 'id' by awaiting the params!
  const { id } = await params;

  const session = await getSession();
  if (!session || session.role !== "academy") redirect("/login");

  // Fetch the specific player using the correctly awaited ID
  const player = await prisma.player.findUnique({
    where: { id },
    include: { videos: true }, 
  });

  // Security Check
  if (!player || player.academyId !== session.userId) {
    redirect("/dashboard/academy");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Back Button */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200">
        <Link href="/dashboard/academy" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{player.name}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full font-mono text-xs font-bold">
              ID: {player.uniqueId}
            </span>
            <span>•</span>
            <span className="capitalize">{player.position || "No position set"}</span>
            <span>•</span>
            <span>{player.age ? `${player.age} years old` : "No age set"}</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Video Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Video size={20} className="text-green-600" /> Player Videos ({player.videos.length})
              </h2>
              {/* Using our brand new file upload modal! */}
              <UploadVideoModal playerId={player.id} />
            </div>

            {player.videos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Video size={48} className="mx-auto mb-4 opacity-30 text-gray-500" />
                <p className="font-medium text-gray-600">No videos uploaded for {player.name} yet.</p>
                <p className="text-sm mt-1">Upload a highlight reel to start sharing with clubs.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {player.videos.map((video: any) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition">
                    <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">⚽</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{video.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{video.views || 0} views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Player Profile Overview */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 h-fit sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User size={20} className="text-blue-600" /> Player Profile
            </h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Full Name</label>
                <p className="font-medium text-gray-900 mt-0.5">{player.name}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Position</label>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">{player.position || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Age</label>
                <p className="font-medium text-gray-900 mt-0.5">{player.age || "-"}</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold uppercase tracking-wider">Nationality</label>
                <p className="font-medium text-gray-900 mt-0.5 capitalize">{player.nationality || "-"}</p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 font-medium py-2 rounded-lg text-sm transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
