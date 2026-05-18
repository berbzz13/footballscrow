import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: role ? { role } : {},
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      verified: true,
      createdAt: true,
      talentProfile: true,
      clubProfile: true,
      agentProfile: true,
      academyProfile: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, verified } = await req.json();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { verified },
  });

  return NextResponse.json({ user });
}
