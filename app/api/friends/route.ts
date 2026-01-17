import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eventManager } from "@/app/lib/events";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get all friends for the user
    const friends = await prisma.friend.findMany({
      where: {
        userId,
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(friends.map((f) => f.friend));
  } catch (error) {
    console.error("Get friends error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(req.url);
    const friendId = searchParams.get("friendId");

    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }

    const friendIdInt = parseInt(friendId);

    // Get user info for the notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, nickname: true },
    });

    // Delete both friendship records (bidirectional)
    await prisma.$transaction([
      prisma.friend.deleteMany({
        where: {
          userId,
          friendId: friendIdInt,
        },
      }),
      prisma.friend.deleteMany({
        where: {
          userId: friendIdInt,
          friendId: userId,
        },
      }),
    ]);

    // Emit real-time event to the removed friend
    eventManager.emit(friendIdInt, "friend_removed", {
      removedBy: userId,
      removedByUsername: user?.username,
      removedByNickname: user?.nickname,
    });

    return NextResponse.json({ message: "Friend removed successfully" });
  } catch (error) {
    console.error("Remove friend error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}