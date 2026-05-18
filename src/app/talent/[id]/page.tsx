import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { MapPin, Calendar, ArrowLeft, Video, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import VideoCard from "@/components/VideoCard";

export default async function TalentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const talent = await prisma.user.findUnique({
    where: { id, role: { in: ["talent", "academy"] } },
    include: {
      talentProfile: true,
      academyProfile: true,
      uploadedVideos: {
        include: { _count: { select: { interests: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!talent) notFound();

  const profile = talent.talentProfile;
  const academy = talent.academyProfile;
  const totalViews = talent.uploadedVideos.reduce((s, v) => s + v.views, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/talents" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6">
        <ArrowLeft size={16} /> Browse Talents
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-gray-800 to-green-800 h-32" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 bg-green-500 rounded-2xl flex items-center justify-center text-3xl font-bold text-white border-4 border-white shadow-md">
              {talent.name.charAt(0)}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-extrabold text-gray-900">{talent.name}</h1>
              {academy?.name && <p className="text-gray-500 text-sm">{academy.name}</p>}
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 flex-wrap">
                {profile?.position && (
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                    {profile.position}
                  </span>
                )}
                {profile?.nationality && (
                  <span className="flex items-center gap-1 text-xs"><MapPin size={12} />{profile.nationality}</span>
                )}
                {profile?.age && <span className="text-xs">{profile.age} years old</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              { label: "Videos", value: talent.uploadedVideos.length },
              { label: "Total Views", value: totalViews },
              ...(profile?.height ? [{ label: "Height", value: profile.height }] : []),
              ...(profile?.preferredFoot ? [{ label: "Preferred Foot", value: profile.preferredFoot }] : []),
            ].map((s) => (
              <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>

          {profile?.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">About</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Videos */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Video size={20} className="text-green-600" />
          Highlight Videos ({talent.uploadedVideos.length})
        </h2>
        {talent.uploadedVideos.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-200">
            <Video size={40} className="mx-auto mb-3 opacity-30" />
            <p>No videos uploaded yet.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {talent.uploadedVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={{
                  ...video,
                  talent: {
                    id: talent.id,
                    name: talent.name,
                    talentProfile: talent.talentProfile,
                    academyProfile: talent.academyProfile,
                  },
                  createdAt: video.createdAt.toISOString(),
                }}
              />
            ))}
          </div>
        )}
      </div>

      {!session && (
        <div className="mt-10 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <p className="text-green-800 font-semibold text-lg mb-2">Interested in {talent.name}?</p>
          <p className="text-green-600 text-sm mb-4">Register as a club or agent to shortlist and request deals.</p>
          <div className="flex justify-center gap-3">
            <Link href="/register?role=club" className="bg-green-600 hover:bg-green-700 text-white font-bold px-5 py-2 rounded-xl text-sm">
              Register as Club
            </Link>
            <Link href="/register?role=agent" className="border border-green-600 text-green-700 hover:bg-green-50 font-bold px-5 py-2 rounded-xl text-sm">
              Register as Agent
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
