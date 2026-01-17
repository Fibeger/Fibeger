import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// DELETE - Remove member from group (admin only, or self-leave)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, userId: targetUserIdStr } = await params;
    const currentUserId = parseInt(session.user.id);
    const groupChatId = parseInt(id);
    const targetUserId = parseInt(targetUserIdStr);

    // Check if current user is member of this group
    const currentUserMembership = await prisma.groupChatMember.findUnique({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId: currentUserId,
        },
      },
    });

    if (!currentUserMembership) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const isSelfLeaving = currentUserId === targetUserId;

    // If not self-leaving, check if current user is admin
    if (!isSelfLeaving && currentUserMembership.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can remove members" },
        { status: 403 }
      );
    }

    // Check if target user is a member
    const targetMembership = await prisma.groupChatMember.findUnique({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId: targetUserId,
        },
      },
    });

    if (!targetMembership) {
      return NextResponse.json(
        { error: "User is not a member" },
        { status: 404 }
      );
    }

    // If trying to remove an admin (and not self), only allow if current user is also admin
    if (targetMembership.role === "admin" && !isSelfLeaving) {
      // Count admins
      const adminCount = await prisma.groupChatMember.count({
        where: {
          groupChatId,
          role: "admin",
        },
      });

      // If this is the last admin, don't allow removal
      if (adminCount === 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin. Promote another member first or delete the group." },
          { status: 400 }
        );
      }
    }

    // If self-leaving and is the last admin
    if (isSelfLeaving && targetMembership.role === "admin") {
      const adminCount = await prisma.groupChatMember.count({
        where: {
          groupChatId,
          role: "admin",
        },
      });

      if (adminCount === 1) {
        return NextResponse.json(
          { error: "Cannot leave as the last admin. Promote another member first or delete the group." },
          { status: 400 }
        );
      }
    }

    // Remove the member
    await prisma.groupChatMember.delete({
      where: {
        groupChatId_userId: {
          groupChatId,
          userId: targetUserId,
        },
      },
    });

    return NextResponse.json({ 
      message: isSelfLeaving ? "Left group successfully" : "Member removed successfully" 
    });
  } catch (error) {
    console.error("Remove member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
