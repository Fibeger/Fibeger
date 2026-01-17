import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

export const middleware = withAuth(
  function middleware(req: NextRequest) {
    // This middleware will run for protected routes
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    "/feed/:path*",
    "/profile/:path*",
    "/messages/:path*",
    "/friends/:path*",
    "/groups/:path*",
    "/api/protected/:path*",
  ],
};
