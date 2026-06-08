import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  
  // THE FIX: Check if the token is completely missing OR if it's an old token missing the userId
  if (!session || !session.userId) {
    const response = NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    // Auto-delete the old, broken cookie so the user doesn't stay stuck!
    response.cookies.delete("auth_token");
    return response;
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
    const response = NextResponse.json({ error: "User not found" }, { status: 404 });
    // Clear cookie if the user was deleted from the database
    response.cookies.delete("auth_token");
    return response;
  }

  const { password: _, ...safeUser } = user;
  return NextResponse.json({ user: safeUser });
}
