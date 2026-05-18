import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      talent: {
        select: {
          id: true,
          name: true,
          talentProfile: true,
          academyProfile: true,
        },
      },
      _count: { select: { interests: true } },
    },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  // Increment view count
  await prisma.video.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  return NextResponse.json({ video });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const video = await prisma.video.findUnique({ where: { id } });
  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.talentId !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.video.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
