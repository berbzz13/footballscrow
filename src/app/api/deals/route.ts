import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let where: Record<string, unknown> = {};

  if (session.role === "talent" || session.role === "academy") {
    where = { talentId: session.userId };
  } else if (session.role === "club" || session.role === "agent") {
    where = { clubAgentId: session.userId };
  }
  // admin sees all

  const deals = await prisma.deal.findMany({
    where,
    include: {
      talent: { select: { id: true, name: true, talentProfile: true } },
      clubAgent: { select: { id: true, name: true, role: true, clubProfile: true, agentProfile: true } },
      video: { select: { id: true, title: true, thumbnailUrl: true } },
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ deals });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.role !== "club" && session.role !== "agent") {
    return NextResponse.json({ error: "Only clubs and agents can request deals" }, { status: 403 });
  }

  const { talentId, videoId, dealType, proposedFee, note } = await req.json();
  if (!talentId) {
    return NextResponse.json({ error: "talentId required" }, { status: 400 });
  }

  const existing = await prisma.deal.findFirst({
    where: {
      talentId,
      clubAgentId: session.userId,
      status: { in: ["pending", "in_negotiation"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "An active deal already exists for this talent" }, { status: 409 });
  }

  const deal = await prisma.deal.create({
    data: {
      talentId,
      clubAgentId: session.userId,
      videoId,
      dealType,
      proposedFee,
      status: "pending",
    },
  });

  if (note) {
    await prisma.message.create({
      data: {
        dealId: deal.id,
        senderId: session.userId,
        content: note,
      },
    });
  }

  return NextResponse.json({ deal }, { status: 201 });
}
