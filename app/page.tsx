'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <main className="flex flex-col items-center justify-center max-w-2xl w-full gap-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
              aria-hidden="true"
            >
              F
            </div>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Welcome to Fibeger
          </h1>

          <p className="text-lg max-w-md mx-auto">
            A modern social platform where you can connect with friends, share moments, and stay in touch with people who matter.
          </p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Simple. Fast. Beautiful.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            className="flex h-12 items-center justify-center rounded-lg px-8 font-semibold text-white transition-all focus:outline-2 focus:outline-offset-2"
            style={{
              backgroundColor: 'var(--accent)',
              outlineColor: 'var(--accent)',
            }}
            href="/auth/signup"
          >
            Get Started
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-lg px-8 font-semibold transition-all border focus:outline-2 focus:outline-offset-2"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
              outlineColor: 'var(--accent)',
            }}
            href="/auth/login"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-8">
          <div 
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h2 className="font-bold text-lg mb-2">Messaging</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>
              Stay connected with instant messaging and real-time conversations.
            </p>
          </div>
          <div 
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h2 className="font-bold text-lg mb-2">Friends</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>
              Build your network and discover new people with similar interests.
            </p>
          </div>
          <div 
            className="rounded-lg p-6 border"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
            }}
          >
            <h2 className="font-bold text-lg mb-2">Community</h2>
            <p style={{ color: 'var(--text-tertiary)' }}>
              Join groups and participate in meaningful conversations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
