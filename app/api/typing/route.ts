import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { eventManager } from '@/app/lib/events';
import { prisma } from '@/app/lib/prisma';

/**
 * POST /api/typing
 * Broadcasts typing indicator to other users in a conversation or group
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { conversationId, groupChatId, isTyping } = body;

    if (!conversationId && !groupChatId) {
      return NextResponse.json(
        { error: 'conversationId or groupChatId required' },
        { status: 400 }
      );
    }

    const userName = (session.user as any)?.nickname || (session.user as any)?.username || 'Someone';

    // Get other members to notify
    let memberIds: number[] = [];

    if (conversationId) {
      const members = await prisma.conversationMember.findMany({
        where: {
          conversationId: parseInt(conversationId),
          userId: { not: userId },
        },
        select: { userId: true },
      });
      memberIds = members.map((m) => m.userId);
    } else if (groupChatId) {
      const members = await prisma.groupChatMember.findMany({
        where: {
          groupChatId: parseInt(groupChatId),
          userId: { not: userId },
        },
        select: { userId: true },
      });
      memberIds = members.map((m) => m.userId);
    }

    // Emit typing event to other members
    memberIds.forEach((memberId) => {
      eventManager.emit(memberId, 'typing', {
        conversationId: conversationId ? parseInt(conversationId) : undefined,
        groupChatId: groupChatId ? parseInt(groupChatId) : undefined,
        userId,
        userName,
        isTyping,
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Typing indicator error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
