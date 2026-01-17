"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'var(--text-primary)' }}></div>
          <p className="mt-6 text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{backgroundAttachment: 'fixed'}}>
      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Welcome Card */}
        <div className="mb-8">
          <div className="rounded-xl p-8 border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {(session?.user as any)?.username}
            </h2>
            <p className="mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
              Stay connected with your friends and explore your feed.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/profile" className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition shadow-md hover:opacity-80" style={{ backgroundColor: 'var(--accent)' }}>
                View Profile
              </Link>
              <Link href="/messages" className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition shadow-md hover:opacity-80" style={{ backgroundColor: 'var(--text-tertiary)' }}>
                Messages
              </Link>
            </div>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="md:col-span-2 space-y-6">
            {/* Create Post Card */}
            <div className="rounded-xl p-6 border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-xl font-bold mb-6">Share Your Thoughts</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="What's on your mind?"
                  className="w-full px-4 py-3 rounded-lg border transition font-medium"
                  style={{
                    borderColor: 'var(--border-color)',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-3 text-white rounded-lg transition font-semibold hover:opacity-80" style={{ backgroundColor: 'var(--text-tertiary)' }}>
                    Upload Photo
                  </button>
                  <button className="flex-1 px-4 py-3 text-white rounded-lg transition font-semibold hover:opacity-80" style={{ backgroundColor: 'var(--accent)' }}>
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Feed Items */}
            <div className="rounded-xl p-6 border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-xl font-bold mb-3">Your Feed</h3>
              <p className="mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
                Posts from users you follow will appear here.
              </p>
              <div className="flex gap-3">
                <Link href="/friends" className="inline-block px-6 py-2 text-white rounded-lg transition font-semibold text-sm hover:opacity-80" style={{ backgroundColor: 'var(--accent)' }}>
                  Find Friends
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-xl p-6 border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold mb-6">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Friends</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>0</span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg border" style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-color)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Messages</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>0</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl p-6 border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <Link href="/profile" className="block w-full p-3 rounded-lg transition font-semibold border" style={{ color: 'var(--text-secondary)', borderColor: 'transparent' }}>
                  My Profile
                </Link>
                <Link href="/messages" className="block w-full p-3 rounded-lg transition font-semibold border" style={{ color: 'var(--text-secondary)', borderColor: 'transparent' }}>
                  Messages
                </Link>
                <Link href="/friends" className="block w-full p-3 rounded-lg transition font-semibold border" style={{ color: 'var(--text-secondary)', borderColor: 'transparent' }}>
                  Friends
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
