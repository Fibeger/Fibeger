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

    const groupChats = await prisma.groupChat.findMany({
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

    // Calculate unread count for each group chat
    const groupChatsWithUnread = await Promise.all(
      groupChats.map(async (groupChat) => {
        // Find current user's membership to get lastReadMessageId
        const userMembership = groupChat.members.find(
          (m) => m.userId === userId
        );

        let unreadCount = 0;

        if (userMembership) {
          // Count messages after lastReadMessageId
          unreadCount = await prisma.message.count({
            where: {
              groupChatId: groupChat.id,
              senderId: { not: userId }, // Don't count own messages
              ...(userMembership.lastReadMessageId
                ? { id: { gt: userMembership.lastReadMessageId } }
                : {}),
            },
          });
        }

        return {
          ...groupChat,
          unreadCount,
        };
      })
    );

    return NextResponse.json(groupChatsWithUnread);
  } catch (error) {
    console.error("Get group chats error:", error);
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
    const { name, description, avatar, memberIds } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    // Create group chat
    const groupChat = await prisma.groupChat.create({
      data: {
        name,
        description,
        avatar,
        members: {
          createMany: {
            data: [
              { userId, role: "admin" }, // Creator is admin
              ...(memberIds || []).map((id: number) => ({
                userId: id,
                role: "member",
              })),
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

    return NextResponse.json(groupChat);
  } catch (error) {
    console.error("Create group chat error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
