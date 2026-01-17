import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        username: true,
        email: true,
        nickname: true,
        bio: true,
        avatar: true,
        lastUsernameChange: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { nickname, bio, avatar } = body;

    // Validate character limits
    if (nickname !== undefined && nickname !== null && nickname.length > 25) {
      return NextResponse.json(
        { error: "Display name must be 25 characters or less" },
        { status: 400 }
      );
    }

    if (bio !== undefined && bio !== null && bio.length > 355) {
      return NextResponse.json(
        { error: "Bio must be 355 characters or less" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (nickname !== undefined) updates.nickname = nickname;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: updates,
      select: {
        id: true,
        username: true,
        nickname: true,
        bio: true,
        avatar: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
