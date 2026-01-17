import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { eventManager } from "@/app/lib/events";

// Add a reaction to a message
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
    const messageId = parseInt(id);
    const userId = parseInt(session.user.id);
    const { emoji } = await req.json();

    if (!emoji || typeof emoji !== 'string') {
      return NextResponse.json(
        { error: "Emoji is required" },
        { status: 400 }
      );
    }

    // Check if message exists and user has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            members: { where: { userId } }
          }
        },
        groupChat: {
          include: {
            members: { where: { userId } }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this message
    const hasAccess = 
      (message.conversationId && (message.conversation?.members?.length ?? 0) > 0) ||
      (message.groupChatId && (message.groupChat?.members?.length ?? 0) > 0);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Create or find existing reaction
    const reaction = await prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        }
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
          }
        }
      }
    });

    // Emit real-time event to all users who can see this message
    if (message.conversationId) {
      const members = await prisma.conversationMember.findMany({
        where: { conversationId: message.conversationId },
        select: { userId: true }
      });
      members.forEach(member => {
        eventManager.emit(member.userId, 'reaction', {
          messageId,
          reaction,
          action: 'add'
        });
      });
    } else if (message.groupChatId) {
      const members = await prisma.groupChatMember.findMany({
        where: { groupChatId: message.groupChatId },
        select: { userId: true }
      });
      members.forEach(member => {
        eventManager.emit(member.userId, 'reaction', {
          messageId,
          reaction,
          action: 'add'
        });
      });
    }

    return NextResponse.json(reaction);
  } catch (error) {
    console.error("Add reaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Remove a reaction from a message
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const messageId = parseInt(id);
    const userId = parseInt(session.user.id);
    
    const url = new URL(req.url);
    const emoji = url.searchParams.get('emoji');

    if (!emoji) {
      return NextResponse.json(
        { error: "Emoji is required" },
        { status: 400 }
      );
    }

    // Check if message exists and user has access
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            members: { where: { userId } }
          }
        },
        groupChat: {
          include: {
            members: { where: { userId } }
          }
        }
      }
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this message
    const hasAccess = 
      (message.conversationId && (message.conversation?.members?.length ?? 0) > 0) ||
      (message.groupChatId && (message.groupChat?.members?.length ?? 0) > 0);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Delete the reaction
    await prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        }
      }
    });

    // Emit real-time event to all users who can see this message
    if (message.conversationId) {
      const members = await prisma.conversationMember.findMany({
        where: { conversationId: message.conversationId },
        select: { userId: true }
      });
      members.forEach(member => {
        eventManager.emit(member.userId, 'reaction', {
          messageId,
          userId,
          emoji,
          action: 'remove'
        });
      });
    } else if (message.groupChatId) {
      const members = await prisma.groupChatMember.findMany({
        where: { groupChatId: message.groupChatId },
        select: { userId: true }
      });
      members.forEach(member => {
        eventManager.emit(member.userId, 'reaction', {
          messageId,
          userId,
          emoji,
          action: 'remove'
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove reaction error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
