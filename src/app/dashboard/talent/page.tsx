import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Eye, Heart, Video, TrendingUp, Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ProfileForm from "./ProfileForm";
import VideoUploadForm from "./VideoUploadForm";
import DeleteVideoButton from "./DeleteVideoButton";

export default async function TalentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "talent" && session.role !== "academy") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { talentProfile: true, academyProfile: true },
  });

  const videos = await prisma.video.findMany({
    where: { talentId: session.userId },
    include: { _count: { select: { interests: true } } },
    orderBy: { createdAt: "desc" },
  });

  const deals = await prisma.deal.findMany({
    where: { talentId: session.userId },
    include: {
      clubAgent: { select: { name: true, role: true } },
      video: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalInterests = videos.reduce((sum, v) => sum + v._count.interests, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full capitalize">
          {session.role}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { icon: <Video size={20} className="text-green-600" />, label: "Videos", value: videos.length },
          { icon: <Eye size={20} className="text-blue-600" />, label: "Total Views", value: totalViews },
          { icon: <Heart size={20} className="text-red-500" />, label: "Interests", value: totalInterests },
          { icon: <TrendingUp size={20} className="text-purple-600" />, label: "Active Deals", value: deals.filter(d => ["pending","in_negotiation","agreed"].includes(d.status)).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-xl">{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Videos & Upload */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Upload */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus size={20} className="text-green-600" /> Upload Highlight Video
            </h2>
            <VideoUploadForm />
          </div>

          {/* My Videos */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Videos ({videos.length})</h2>
            {videos.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Video size={40} className="mx-auto mb-3 opacity-30" />
                <p>No videos uploaded yet. Add your first highlight!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 group">
                    <div className="w-20 h-12 bg-gray-200 rounded-lg overflow-hidden shrink-0">
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">⚽</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/videos/${video.id}`} className="font-semibold text-gray-900 hover:text-green-600 text-sm truncate block">
                        {video.title}
                      </Link>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1"><Eye size={11} />{video.views}</span>
                        <span className="flex items-center gap-1"><Heart size={11} />{video._count.interests}</span>
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                    </div>
                    <DeleteVideoButton videoId={video.id} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deals */}
          {deals.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Deals</h2>
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {deal.clubAgent.name} <span className="text-gray-500 font-normal capitalize">({deal.clubAgent.role})</span>
                      </p>
                      {deal.video && <p className="text-xs text-gray-500">Re: {deal.video.title}</p>}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      deal.status === "completed" ? "bg-green-100 text-green-700" :
                      deal.status === "rejected" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {deal.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Profile */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Profile</h2>
            <ProfileForm user={user} role={session.role} />
          </div>
        </div>
      </div>
    </div>
  );
}
