import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const interests = await prisma.interest.findMany({
    where: { viewerId: session.userId },
    include: {
      video: {
        include: {
          talent: {
            select: {
              id: true,
              name: true,
              talentProfile: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ interests });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.role !== "club" && session.role !== "agent") {
    return NextResponse.json({ error: "Only clubs and agents can express interest" }, { status: 403 });
  }

  const { videoId, status, note } = await req.json();
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }

  const interest = await prisma.interest.upsert({
    where: { viewerId_videoId: { viewerId: session.userId, videoId } },
    update: { status: status || "interested", note },
    create: { viewerId: session.userId, videoId, status: status || "interested", note },
  });

  return NextResponse.json({ interest });
}
