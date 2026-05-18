import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      talentProfile: true,
      academyProfile: true,
      clubProfile: true,
      agentProfile: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
