import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Eye, MapPin, Calendar, Heart, ArrowLeft } from "lucide-react";
import { formatDate, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/utils";
import DealRequestButton from "./DealRequestButton";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      talent: {
        select: {
          id: true,
          name: true,
          talentProfile: true,
          academyProfile: true,
          _count: { select: { uploadedVideos: true } },
        },
      },
      _count: { select: { interests: true } },
    },
  });

  if (!video) notFound();

  await prisma.video.update({ where: { id }, data: { views: { increment: 1 } } });

  let isInterested = false;
  let existingDeal = null;

  if (session && (session.role === "club" || session.role === "agent")) {
    const interest = await prisma.interest.findUnique({
      where: { viewerId_videoId: { viewerId: session.userId, videoId: id } },
    });
    isInterested = !!interest;

    existingDeal = await prisma.deal.findFirst({
      where: {
        talentId: video.talentId,
        clubAgentId: session.userId,
        status: { in: ["pending", "in_negotiation", "agreed"] },
      },
    });
  }

  const profile = video.talent.talentProfile;
  const academy = video.talent.academyProfile;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/talents" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm mb-6">
        <ArrowLeft size={16} /> Back to talents
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video">
            <video
              src={video.videoUrl}
              controls
              poster={video.thumbnailUrl || undefined}
              className="w-full h-full"
              preload="metadata"
            />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">{video.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Eye size={14} /> {video.views} views</span>
              <span className="flex items-center gap-1"><Heart size={14} /> {video._count.interests} interested</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(video.createdAt)}</span>
            </div>
            {video.description && (
              <p className="mt-4 text-gray-600 leading-relaxed">{video.description}</p>
            )}
            {video.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {video.tags.split(",").map((tag) => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Talent Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-lg font-bold text-green-700">
                {video.talent.name.charAt(0)}
              </div>
              <div>
                <Link
                  href={`/talent/${video.talent.id}`}
                  className="font-bold text-gray-900 hover:text-green-600"
                >
                  {video.talent.name}
                </Link>
                {academy && <p className="text-xs text-gray-500">{academy.name}</p>}
                <p className="text-xs text-gray-400">{video.talent._count.uploadedVideos} videos</p>
              </div>
            </div>

            {profile && (
              <div className="space-y-2 text-sm">
                {profile.position && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Position</span>
                    <span className="font-medium text-gray-900 bg-green-50 text-green-700 px-2 py-0.5 rounded">{profile.position}</span>
                  </div>
                )}
                {profile.nationality && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nationality</span>
                    <span className="font-medium flex items-center gap-1"><MapPin size={12} />{profile.nationality}</span>
                  </div>
                )}
                {profile.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Age</span>
                    <span className="font-medium">{profile.age} years</span>
                  </div>
                )}
                {profile.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Height</span>
                    <span className="font-medium">{profile.height}</span>
                  </div>
                )}
                {profile.preferredFoot && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Preferred Foot</span>
                    <span className="font-medium">{profile.preferredFoot}</span>
                  </div>
                )}
              </div>
            )}

            {profile?.bio && (
              <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Action Card */}
          {session && (session.role === "club" || session.role === "agent") && (
            <DealRequestButton
              videoId={id}
              talentId={video.talentId}
              talentName={video.talent.name}
              isInterested={isInterested}
              existingDealId={existingDeal?.id}
              existingDealStatus={existingDeal?.status}
            />
          )}

          {!session && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
              <p className="text-green-800 font-semibold mb-1">Interested in this talent?</p>
              <p className="text-green-600 text-sm mb-4">Register as a club or agent to shortlist and request deals.</p>
              <Link
                href="/register?role=club"
                className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-5 py-2 rounded-lg"
              >
                Register Free
              </Link>
            </div>
          )}

          {/* Escrow Notice */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">🔒 Protected by FootballScrow</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              All deals on this platform are facilitated by FootballScrow as a neutral escrow agent.
              No direct contact between parties is permitted to ensure fairness and protection for all.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
