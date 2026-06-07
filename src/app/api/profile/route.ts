import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const formData = await req.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;

    // 1. Update the base User record (Name is shared across all roles)
    if (name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name },
      });
    }

    // 2. Update the Role-Specific Profile
    if (session.role === "talent") {
      const dateOfBirthStr = formData.get("dateOfBirth") as string;
      const nin = formData.get("nin") as string;
      
      let dateOfBirth = null;
      let calculatedAge = null;

      // Automatically calculate real age to prevent falsification and keep feed working
      if (dateOfBirthStr) {
        dateOfBirth = new Date(dateOfBirthStr);
        const ageDifMs = Date.now() - dateOfBirth.getTime();
        const ageDate = new Date(ageDifMs);
        calculatedAge = Math.abs(ageDate.getUTCFullYear() - 1970);
      }

      await prisma.talentProfile.update({
        where: { userId: session.userId },
        data: {
          bio: bio || null,
          position: formData.get("position") as string || null,
          nationality: formData.get("nationality") as string || null,
          dateOfBirth: dateOfBirth,
          age: calculatedAge,
          nin: nin || null,
          height: formData.get("height") as string || null,
          preferredFoot: formData.get("preferredFoot") as string || null,
        },
      });
    } else if (session.role === "academy") {
      await prisma.academyProfile.update({
        where: { userId: session.userId },
        data: {
          bio: bio || null,
          location: formData.get("location") as string || null,
        },
      });
    }

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Profile update error:", error);
    
    // Catch unique constraint errors (e.g., if someone tries to use an already registered NIN)
    if (error.code === 'P2002' && error.meta?.target?.includes('nin')) {
      return NextResponse.json(
        { error: "This NIN is already registered to another account." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
