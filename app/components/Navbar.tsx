'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900 shadow-lg border-b border-slate-700" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/feed" 
            className="flex items-center gap-3 group rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
            aria-label="Fibeger - Home"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all" aria-hidden="true">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl hidden sm:inline text-slate-100">Fibeger</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/feed"
              className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${
                isActive('/feed')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={isActive('/feed') ? 'page' : undefined}
            >
              Home
            </Link>
            <Link
              href="/messages"
              className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${
                isActive('/messages')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={isActive('/messages') ? 'page' : undefined}
            >
              Messages
            </Link>
            <Link
              href="/friends"
              className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${
                isActive('/friends')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={isActive('/friends') ? 'page' : undefined}
            >
              Friends
            </Link>
            <Link
              href="/groups"
              className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${
                isActive('/groups')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={isActive('/groups') ? 'page' : undefined}
            >
              Groups
            </Link>
            <Link
              href="/profile"
              className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2 ${
                isActive('/profile')
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              aria-current={isActive('/profile') ? 'page' : undefined}
            >
              Profile
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-2">
            <Link
              href="/messages"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
              aria-label="Messages"
            >
              💬
            </Link>
            <Link
              href="/friends"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
              aria-label="Friends"
            >
              👥
            </Link>
            <Link
              href="/profile"
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
              aria-label="Profile"
            >
              👤
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-300">
                {(session.user as any)?.username || session.user?.email}
              </span>
            </div>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
              aria-label="Sign out"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
