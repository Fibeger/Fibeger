import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(session.user.id);
    const groupChatId = parseInt(id);

    // Check if user is member of this group
    const isMember = await prisma.groupChatMember.findUnique({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const messages = await prisma.message.findMany({
      where: {
        groupChatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Get group messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const groupChatId = parseInt(id);

    // Check if user is member of this group
    const isMember = await prisma.groupChatMember.findUnique({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId,
        },
      },
    });

    if (!isMember) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        groupChatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          },
        },
      },
    });

    // Update group chat's updatedAt and get group info
    const groupChat = await prisma.groupChat.update({
      where: { id: groupChatId },
      data: { updatedAt: new Date() },
      select: { name: true },
    });

    // Get all group members except sender
    const members = await prisma.groupChatMember.findMany({
      where: {
        groupChatId,
        userId: { not: userId },
      },
      select: { userId: true },
    });

    // Create notifications for other members
    const senderName = message.sender.nickname || message.sender.username;
    const notificationPromises = members.map((member) =>
      prisma.notification.create({
        data: {
          userId: member.userId,
          type: "message",
          title: `New Message in ${groupChat.name}`,
          message: `${senderName}: ${content.substring(0, 50)}${content.length > 50 ? "..." : ""}`,
          link: `/groups?groupchat=${groupChatId}`,
        },
      })
    );

    await Promise.all(notificationPromises);

    return NextResponse.json(message);
  } catch (error) {
    console.error("Create group message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
