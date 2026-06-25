import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  try { return await verifyToken(token); } catch { return null; }
}

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ unreadCount: 0 });

    const unreadCount = await prisma.directMessage.count({
      where: { receiverId: user.userId, isRead: false },
    });
    return NextResponse.json({ unreadCount });
  } catch {
    return NextResponse.json({ unreadCount: 0 });
  }
}
