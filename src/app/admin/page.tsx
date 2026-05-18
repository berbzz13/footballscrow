import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Users, Video, Handshake, CheckCircle, AlertCircle } from "lucide-react";
import { formatDate, DEAL_STATUS_LABELS, DEAL_STATUS_COLORS } from "@/lib/utils";
import AdminDealActions from "./AdminDealActions";
import AdminUserActions from "./AdminUserActions";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [
    totalUsers,
    talents,
    clubs,
    agents,
    academies,
    videos,
    pendingDeals,
    allDeals,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "talent" } }),
    prisma.user.count({ where: { role: "club" } }),
    prisma.user.count({ where: { role: "agent" } }),
    prisma.user.count({ where: { role: "academy" } }),
    prisma.video.count(),
    prisma.deal.count({ where: { status: "pending" } }),
    prisma.deal.findMany({
      include: {
        talent: { select: { id: true, name: true, talentProfile: true } },
        clubAgent: { select: { id: true, name: true, role: true } },
        video: { select: { id: true, title: true } },
        messages: {
          include: { sender: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { not: "admin" } },
      select: {
        id: true, name: true, email: true, role: true, verified: true, createdAt: true,
        talentProfile: true, clubProfile: true, agentProfile: true, academyProfile: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">FootballScrow Escrow Management</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">ADMIN</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Users", value: totalUsers, sub: `${talents} talents · ${clubs} clubs · ${agents} agents · ${academies} academies`, color: "text-blue-600" },
          { label: "Videos", value: videos, sub: "Total uploaded", color: "text-green-600" },
          { label: "Pending Deals", value: pendingDeals, sub: "Awaiting action", color: "text-yellow-600" },
          { label: "Total Deals", value: allDeals.length, sub: `${allDeals.filter(d => d.status === "completed").length} completed`, color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="font-semibold text-gray-900 mt-1">{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending Deals Alert */}
      {pendingDeals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <AlertCircle size={20} className="text-yellow-600 shrink-0" />
          <p className="text-yellow-800 text-sm">
            <strong>{pendingDeals} deal{pendingDeals > 1 ? "s" : ""}</strong> pending your review. Act below to facilitate negotiations.
          </p>
        </div>
      )}

      <div className="space-y-8">
        {/* Deals Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Handshake size={22} className="text-blue-600" /> Deal Management
          </h2>
          {allDeals.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Handshake size={40} className="mx-auto mb-3 opacity-30" />
              <p>No deals yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {allDeals.map((deal) => (
                <AdminDealActions key={deal.id} deal={deal} adminId={session.userId} />
              ))}
            </div>
          )}
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users size={22} className="text-green-600" /> Recent Users
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-600">Name</th>
                  <th className="pb-3 font-semibold text-gray-600">Email</th>
                  <th className="pb-3 font-semibold text-gray-600">Role</th>
                  <th className="pb-3 font-semibold text-gray-600">Joined</th>
                  <th className="pb-3 font-semibold text-gray-600">Status</th>
                  <th className="pb-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="py-3 text-gray-500">{user.email}</td>
                    <td className="py-3">
                      <span className={`capitalize text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === "talent" ? "bg-green-100 text-green-700" :
                        user.role === "club" ? "bg-blue-100 text-blue-700" :
                        user.role === "agent" ? "bg-orange-100 text-orange-700" :
                        "bg-purple-100 text-purple-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="py-3">
                      {user.verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs"><CheckCircle size={14} /> Verified</span>
                      ) : (
                        <span className="text-yellow-600 text-xs">Unverified</span>
                      )}
                    </td>
                    <td className="py-3">
                      <AdminUserActions userId={user.id} verified={user.verified} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
