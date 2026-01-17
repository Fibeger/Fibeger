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

    const userId = parseInt(session.user.id);

    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        // Find current user's membership to get lastReadMessageId
        const userMembership = conversation.members.find(
          (m) => m.userId === userId
        );

        let unreadCount = 0;

        if (userMembership) {
          // Count messages after lastReadMessageId
          unreadCount = await prisma.message.count({
            where: {
              conversationId: conversation.id,
              senderId: { not: userId }, // Don't count own messages
              ...(userMembership.lastReadMessageId
                ? { id: { gt: userMembership.lastReadMessageId } }
                : {}),
            },
          });
        }

        return {
          ...conversation,
          unreadCount,
        };
      })
    );

    return NextResponse.json(conversationsWithUnread);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json(
        { error: "Friend ID is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);
    const otherUserId = parseInt(friendId);

    if (userId === otherUserId) {
      return NextResponse.json(
        { error: "Cannot create conversation with yourself" },
        { status: 400 }
      );
    }

    // Check if users are friends
    const isFriend = await prisma.friend.findUnique({
      where: {
        userId_friendId: {
          userId,
          friendId: otherUserId,
        },
      },
    });

    if (!isFriend) {
      return NextResponse.json(
        { error: "You are not friends with this user" },
        { status: 403 }
      );
    }

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            members: {
              some: {
                userId,
              },
            },
          },
          {
            members: {
              some: {
                userId: otherUserId,
              },
            },
          },
        ],
      },
    });

    if (existingConversation) {
      return NextResponse.json(existingConversation);
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        members: {
          createMany: {
            data: [
              { userId },
              { userId: otherUserId },
            ],
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
