import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      talent: { select: { id: true, name: true, talentProfile: true } },
      clubAgent: { select: { id: true, name: true, role: true, clubProfile: true, agentProfile: true } },
      video: true,
      messages: {
        include: { sender: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const canAccess =
    session.role === "admin" ||
    deal.talentId === session.userId ||
    deal.clubAgentId === session.userId;

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ deal });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  const body = await req.json();
  const { status, adminNotes, message } = body;

  // Only admin can change status
  if (status && session.role !== "admin") {
    return NextResponse.json({ error: "Only admin can update deal status" }, { status: 403 });
  }

  const canAccess =
    session.role === "admin" ||
    deal.talentId === session.userId ||
    deal.clubAgentId === session.userId;

  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
  });

  if (message) {
    await prisma.message.create({
      data: {
        dealId: id,
        senderId: session.userId,
        content: message,
        isAdmin: session.role === "admin",
      },
    });
  }

  return NextResponse.json({ deal: updated });
}
