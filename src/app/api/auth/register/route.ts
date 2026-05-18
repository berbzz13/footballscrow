import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const validRoles = ["talent", "academy", "club", "agent"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role,
      },
    });

    // Create role-specific profile
    if (role === "talent") {
      await prisma.talentProfile.create({ data: { userId: user.id } });
    } else if (role === "academy") {
      await prisma.academyProfile.create({ data: { userId: user.id } });
    } else if (role === "club") {
      await prisma.clubProfile.create({ data: { userId: user.id } });
    } else if (role === "agent") {
      await prisma.agentProfile.create({ data: { userId: user.id } });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
