import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * Database Connection Test Endpoint
 * 
 * Visit this endpoint to verify your database is connected properly on Vercel.
 * Example: https://your-app.vercel.app/api/test-db
 * 
 * ⚠️ SECURITY: Remove this endpoint after verifying your deployment works!
 */
export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Test if tables exist by trying to query each model
    const conversationCount = await prisma.conversation.count();
    const groupChatCount = await prisma.groupChat.count();
    const friendRequestCount = await prisma.friendRequest.count();
    
    return NextResponse.json({ 
      success: true, 
      message: "✅ Database connected successfully!",
      stats: {
        users: userCount,
        conversations: conversationCount,
        groupChats: groupChatCount,
        friendRequests: friendRequestCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Database connection error:", error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof Error ? error.stack : undefined,
      hint: "Check that DATABASE_URL is set in Vercel environment variables and migrations have been run"
    }, { status: 500 });
  }
}
