import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Middleware to add pathname to headers for all routes
export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", req.nextUrl.pathname);

  // Check if this is a protected route
  const protectedPaths = ["/feed", "/profile", "/messages", "/friends", "/groups", "/api/protected"];
  const isProtectedPath = protectedPaths.some(path => req.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    // Use withAuth for protected routes
    return withAuth(
      function middleware(req) {
        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        return response;
      },
      {
        callbacks: {
          authorized: ({ token }) => !!token,
        },
        pages: {
          signIn: "/auth/login",
        },
      }
    )(req as any, {} as any);
  }

  // For non-protected routes, just pass the headers through
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
