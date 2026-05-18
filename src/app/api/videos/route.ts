import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const position = searchParams.get("position");
  const nationality = searchParams.get("nationality");
  const search = searchParams.get("search");
  const talentId = searchParams.get("talentId");

  const where: Record<string, unknown> = {};

  if (talentId) {
    where.talentId = talentId;
  }

  if (position || nationality || search) {
    where.talent = {
      talentProfile: {
        ...(position && { position }),
        ...(nationality && { nationality }),
      },
      ...(search && {
        name: { contains: search },
      }),
    };
  }

  const [videos, total] = await Promise.all([
    prisma.video.findMany({
      where,
      include: {
        talent: {
          select: {
            id: true,
            name: true,
            talentProfile: true,
            academyProfile: true,
          },
        },
        _count: { select: { interests: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.video.count({ where }),
  ]);

  return NextResponse.json({ videos, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.role !== "talent" && session.role !== "academy") {
    return NextResponse.json({ error: "Only talents and academies can upload videos" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const videoFile = formData.get("video") as File;
    const thumbnailFile = formData.get("thumbnail") as File | null;

    if (!title || !videoFile) {
      return NextResponse.json({ error: "Title and video are required" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public/uploads/videos");
    await mkdir(uploadsDir, { recursive: true });

    const videoExt = videoFile.name.split(".").pop();
    const videoName = `${uuidv4()}.${videoExt}`;
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(path.join(uploadsDir, videoName), videoBuffer);
    const videoUrl = `/uploads/videos/${videoName}`;

    let thumbnailUrl = null;
    if (thumbnailFile) {
      const thumbDir = path.join(process.cwd(), "public/uploads/thumbnails");
      await mkdir(thumbDir, { recursive: true });
      const thumbExt = thumbnailFile.name.split(".").pop();
      const thumbName = `${uuidv4()}.${thumbExt}`;
      const thumbBuffer = Buffer.from(await thumbnailFile.arrayBuffer());
      await writeFile(path.join(thumbDir, thumbName), thumbBuffer);
      thumbnailUrl = `/uploads/thumbnails/${thumbName}`;
    }

    const video = await prisma.video.create({
      data: {
        title,
        description,
        tags,
        videoUrl,
        thumbnailUrl,
        talentId: session.userId,
      },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
