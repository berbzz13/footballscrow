import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Heart, Handshake, Search } from "lucide-react";
import { formatDate, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/utils";
import AgentProfileForm from "./AgentProfileForm";
import DealMessaging from "../club/DealMessaging";

export default async function AgentDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "agent") redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { agentProfile: true },
  });

  const interests = await prisma.interest.findMany({
    where: { viewerId: session.userId },
    include: {
      video: {
        include: {
          talent: { select: { id: true, name: true, talentProfile: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const deals = await prisma.deal.findMany({
    where: { clubAgentId: session.userId },
    include: {
      talent: { select: { id: true, name: true, talentProfile: true } },
      video: { select: { id: true, title: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Agent Dashboard</h1>
          <p className="text-gray-500 mt-1">{user?.name}</p>
        </div>
        <Link href="/talents" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
          <Search size={16} /> Browse Talents
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <Heart size={20} className="text-red-500" />, label: "Shortlisted", value: interests.length },
          { icon: <Handshake size={20} className="text-blue-600" />, label: "Total Deals", value: deals.length },
          { icon: <Handshake size={20} className="text-green-600" />, label: "Completed", value: deals.filter(d => d.status === "completed").length },
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
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Deal Requests</h2>
            {deals.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Handshake size={40} className="mx-auto mb-3 opacity-30" />
                <p>No deals yet.</p>
                <Link href="/talents" className="text-green-600 text-sm font-semibold hover:underline mt-2 block">Browse Talents →</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {deals.map((deal) => (
                  <div key={deal.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Link href={`/talent/${deal.talent.id}`} className="font-semibold text-gray-900 hover:text-green-600">
                          {deal.talent.name}
                        </Link>
                        {deal.video && <p className="text-xs text-gray-500 mt-0.5">Re: {deal.video.title}</p>}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${DEAL_STATUS_COLORS[deal.status]}`}>
                        {DEAL_STATUS_LABELS[deal.status] || deal.status}
                      </span>
                    </div>
                    {deal.messages.length > 0 && (
                      <DealMessaging deal={deal} currentUserId={session.userId} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Shortlist ({interests.length})</h2>
            {interests.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">No players shortlisted yet.</div>
            ) : (
              <div className="space-y-3">
                {interests.map((interest) => {
                  const talent = interest.video.talent;
                  const profile = talent.talentProfile;
                  return (
                    <div key={interest.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
                        {talent.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/talent/${talent.id}`} className="font-semibold text-gray-900 hover:text-green-600 text-sm">{talent.name}</Link>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          {profile?.position && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{profile.position}</span>}
                          {profile?.nationality && <span>{profile.nationality}</span>}
                        </div>
                      </div>
                      <Link href={`/videos/${interest.videoId}`} className="text-xs text-green-600 hover:underline shrink-0">View →</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Agent Profile</h2>
            <AgentProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}
