import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, phoneNumber, dateOfBirth, nin } = body;

    // 1. Basic Validation
    if (!name || !email || !password || !role || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 400 });
    }

    // Check if NIN is already used (if provided)
    if (role === "talent" && nin) {
      const existingNin = await prisma.talentProfile.findUnique({
        where: { nin }
      });
      if (existingNin) {
        return NextResponse.json({ error: "This NIN is already registered to another account." }, { status: 400 });
      }
    }

    // 3. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Generate Unique ID
    const uniqueId = `clz${Math.random().toString(36).substring(2, 8)}`;

    // 5. Create User and their specific Profile in one transaction
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phoneNumber, // Now required and saved
        uniqueId,
        // Create the associated profile based on the role
        ...(role === "talent" && {
          talentProfile: {
            create: {
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
              nin: nin || null,
            }
          }
        }),
        ...(role === "academy" && {
          academyProfile: { create: { name } }
        }),
        ...(role === "club" && {
          clubProfile: { create: { name } }
        }),
        ...(role === "agent" && {
          agentProfile: { create: {} }
        }),
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", user: { id: newUser.id, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error during registration" }, { status: 500 });
  }
}
