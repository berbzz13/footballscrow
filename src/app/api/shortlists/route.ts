import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

// Helper function to authenticate the request
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

// GET: Fetch the user's shortlist (mapped to video IDs so the UI buttons light up)
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "club" && user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // Fetch all records where this agent/club saved a player
    const shortlists = await prisma.shortlist.findMany({
      where: { userId: user.userId },
    });

    const talentIds = shortlists.filter(s => s.talentId).map(s => s.talentId);
    const playerIds = shortlists.filter(s => s.playerId).map(s => s.playerId);

    // Find all videos belonging to these shortlisted players
    const videos = await prisma.video.findMany({
      where: {
        OR: [
          { talentId: { in: talentIds as string[] } },
          { playerId: { in: playerIds as string[] } }
        ]
      },
      select: { id: true }
    });

    // Format it to match what the frontend expects { videoId: string }
    const formattedShortlists = videos.map(v => ({ videoId: v.id }));

    return NextResponse.json({ shortlists: formattedShortlists });
  } catch (error) {
    console.error("Error fetching shortlists:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Toggle adding or removing a player from the shortlist
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user || (user.role !== "club" && user.role !== "agent")) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { videoId } = await req.json();
    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    // Find the video to see which talent or player it belongs to
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const talentId = video.talentId;
    const playerId = video.playerId;

    // Check if the user has already shortlisted this specific player/talent
    const existingShortlist = await prisma.shortlist.findFirst({
      where: {
        userId: user.userId,
        talentId: talentId || undefined,
        playerId: playerId || undefined,
      }
    });

    if (existingShortlist) {
      // If it exists, toggle it OFF (Remove from shortlist)
      await prisma.shortlist.delete({ where: { id: existingShortlist.id } });
      return NextResponse.json({ message: "Removed from shortlist", status: "removed" });
    } else {
      // If it doesn't exist, toggle it ON (Add to shortlist)
      await prisma.shortlist.create({
        data: {
          userId: user.userId,
          talentId: talentId,
          playerId: playerId
        }
      });
      return NextResponse.json({ message: "Added to shortlist", status: "added" }, { status: 201 });
    }
  } catch (error) {
    console.error("Error updating shortlist:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
