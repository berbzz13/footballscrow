import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const name = formData.get("name") as string;
  const avatarFile = formData.get("avatar") as File | null;

  let avatarUrl: string | null = null;
  if (avatarFile) {
    const dir = path.join(process.cwd(), "public/uploads/avatars");
    await mkdir(dir, { recursive: true });
    const ext = avatarFile.name.split(".").pop();
    const filename = `${uuidv4()}.${ext}`;
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);
    avatarUrl = `/uploads/avatars/${filename}`;
  }

  if (name) {
    await prisma.user.update({ where: { id: session.userId }, data: { name } });
  }

  const profileData: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "name" && key !== "avatar" && typeof value === "string") {
      profileData[key] = value || null;
    }
  }

  if (avatarUrl) profileData.profileImage = avatarUrl;

  const { role } = session;

  if (role === "talent") {
    const age = profileData.age ? parseInt(profileData.age as string) : undefined;
    await prisma.talentProfile.upsert({
      where: { userId: session.userId },
      update: { ...profileData, ...(age !== undefined && { age }) },
      create: { userId: session.userId, ...profileData, ...(age !== undefined && { age }) },
    });
  } else if (role === "academy") {
    await prisma.academyProfile.upsert({
      where: { userId: session.userId },
      update: profileData,
      create: { userId: session.userId, ...profileData },
    });
  } else if (role === "club") {
    await prisma.clubProfile.upsert({
      where: { userId: session.userId },
      update: profileData,
      create: { userId: session.userId, ...profileData },
    });
  } else if (role === "agent") {
    await prisma.agentProfile.upsert({
      where: { userId: session.userId },
      update: profileData,
      create: { userId: session.userId, ...profileData },
    });
  }

  return NextResponse.json({ success: true });
}
