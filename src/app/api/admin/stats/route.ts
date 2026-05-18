import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    totalUsers,
    talents,
    clubs,
    agents,
    academies,
    videos,
    deals,
    pendingDeals,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "talent" } }),
    prisma.user.count({ where: { role: "club" } }),
    prisma.user.count({ where: { role: "agent" } }),
    prisma.user.count({ where: { role: "academy" } }),
    prisma.video.count(),
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "pending" } }),
  ]);

  return NextResponse.json({
    totalUsers,
    talents,
    clubs,
    agents,
    academies,
    videos,
    deals,
    pendingDeals,
  });
}
