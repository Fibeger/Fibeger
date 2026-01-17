import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, groupChatId } = body;
    const userId = parseInt(session.user.id);

    if (!conversationId && !groupChatId) {
      return NextResponse.json(
        { error: "Either conversationId or groupChatId is required" },
        { status: 400 }
      );
    }

    if (conversationId && groupChatId) {
      return NextResponse.json(
        { error: "Provide either conversationId or groupChatId, not both" },
        { status: 400 }
      );
    }

    if (conversationId) {
      const convId = parseInt(conversationId);

      // Check if user is member of this conversation
      const membership = await prisma.conversationMember.findUnique({
        where: {
          conversationId_userId: {
            conversationId: convId,
            userId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Get the latest message in the conversation
      const latestMessage = await prisma.message.findFirst({
        where: { conversationId: convId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (latestMessage) {
        // Update lastReadMessageId
        await prisma.conversationMember.update({
          where: {
            conversationId_userId: {
              conversationId: convId,
              userId,
            },
          },
          data: {
            lastReadMessageId: latestMessage.id,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (groupChatId) {
      const groupId = parseInt(groupChatId);

      // Check if user is member of this group
      const membership = await prisma.groupChatMember.findUnique({
        where: {
          groupChatId_userId: {
            groupChatId: groupId,
            userId,
          },
        },
      });

      if (!membership) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      // Get the latest message in the group
      const latestMessage = await prisma.message.findFirst({
        where: { groupChatId: groupId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (latestMessage) {
        // Update lastReadMessageId
        await prisma.groupChatMember.update({
          where: {
            groupChatId_userId: {
              groupChatId: groupId,
              userId,
            },
          },
          data: {
            lastReadMessageId: latestMessage.id,
          },
        });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Mark messages as read error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
