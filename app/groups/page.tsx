'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to messages page since groups are now in the sidebar
    router.push('/messages');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'var(--text-primary)' }}></div>
        <p className="mt-6 text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>Redirecting...</p>
      </div>
    </div>
  );
}
