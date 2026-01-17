'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSidebar } from '../context/SidebarContext';
import NotificationBell from './NotificationBell';

export default function MobileHeader() {
  const { data: session } = useSession();
  const { toggleSidebar } = useSidebar();

  if (!session) {
    return null;
  }

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 shadow-lg border-b border-slate-700">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburger Menu */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        {/* Logo */}
        <Link 
          href="/feed" 
          className="flex items-center gap-2 group rounded-lg focus:outline-2 focus:outline-yellow-400 focus:outline-offset-2"
          aria-label="Fibeger - Home"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all" aria-hidden="true">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <span className="font-bold text-lg text-slate-100">Fibeger</span>
        </Link>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
