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

// GET: Fetch all direct messages for the logged-in user
export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user.userId },
          { receiverId: user.userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, role: true, uniqueId: true } },
        receiver: { select: { id: true, name: true, role: true, uniqueId: true } }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST: Send a new direct message
export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    let finalReceiverId = receiverId;

    // RULE 1: If sender is a Talent or Academy, FORCE the receiver to be the Admin
    if (user.role === "talent" || user.role === "academy") {
      const admin = await prisma.user.findFirst({ where: { role: "admin" } });
      if (!admin) {
        return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
      }
      finalReceiverId = admin.id; // Overwrite whatever the frontend sent
    } 
    // RULE 2: Admin can message anyone, so they must provide a valid receiverId
    else if (user.role === "admin") {
      if (!receiverId) {
        return NextResponse.json({ error: "Receiver ID is required for Admin" }, { status: 400 });
      }
    } 
    // RULE 3: Agents and Clubs are blocked from direct messages (they use Deal Messaging instead)
    else {
      return NextResponse.json({ error: "Agents and Clubs cannot initiate direct messages." }, { status: 403 });
    }

    const newMessage = await prisma.directMessage.create({
      data: {
        senderId: user.userId,
        receiverId: finalReceiverId,
        content: content
      },
      include: {
        sender: { select: { id: true, name: true, role: true, uniqueId: true } },
        receiver: { select: { id: true, name: true, role: true, uniqueId: true } }
      }
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
