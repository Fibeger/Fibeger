import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          username: user.username,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const DAYS_BETWEEN_USERNAME_CHANGE = 7;

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newUsername } = body;

    if (!newUsername || newUsername.trim().length === 0) {
      return NextResponse.json(
        { error: "New username is required" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    // Get user to check last username change
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check cooldown
    if (user.lastUsernameChange) {
      const daysSinceChange = Math.floor(
        (Date.now() - user.lastUsernameChange.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceChange < DAYS_BETWEEN_USERNAME_CHANGE) {
        const daysRemaining =
          DAYS_BETWEEN_USERNAME_CHANGE - daysSinceChange;
        return NextResponse.json(
          {
            error: `You can change your username again in ${daysRemaining} day(s)`,
            daysRemaining,
          },
          { status: 429 }
        );
      }
    }

    // Check if new username is already taken
    const existingUser = await prisma.user.findUnique({
      where: { username: newUsername },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Record the username change
    await prisma.usernameHistory.create({
      data: {
        userId,
        oldUsername: user.username,
        newUsername,
      },
    });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: newUsername,
        lastUsernameChange: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return NextResponse.json({
      message: "Username changed successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Username change error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
