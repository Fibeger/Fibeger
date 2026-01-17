'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface UserPreview {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

interface FriendRequest {
  id: number;
  sender: UserPreview;
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserPreview[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchFriendRequests();
  }, [session, router]);

  const fetchFriendRequests = async () => {
    try {
      const res = await fetch('/api/friends/request/dummy');
      if (res.ok) {
        const data = await res.json();
        setFriendRequests(data);
      }
    } catch (error) {
      console.error('Failed to load friend requests');
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/friends/request?query=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (error) {
      setMessage('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleSendFriendRequest = async (username: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverUsername: username }),
      });

      if (res.ok) {
        setMessage('✓ Friend request sent!');
        setSearchQuery('');
        setSearchResults([]);
        setTimeout(() => setMessage(''), 3000);
      } else {
        const error = await res.json();
        setMessage(error.error || 'Failed to send request');
      }
    } catch (error) {
      setMessage('Error sending friend request');
    }
  };

  const handleRespondToRequest = async (
    requestId: number,
    action: 'accept' | 'reject'
  ) => {
    try {
      const res = await fetch(`/api/friends/request/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        setMessage(action === 'accept' ? '✓ Friend added!' : '✗ Request rejected');
        fetchFriendRequests();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to respond to request');
      }
    } catch (error) {
      setMessage('Error responding to request');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" style={{backgroundAttachment: 'fixed'}}>
      <div className="max-w-4xl mx-auto p-4 sm:p-8">
        <h1 className="text-4xl font-bold text-slate-100 mb-8">Find Friends</h1>

        {message && (
          <div className={`mb-6 p-4 rounded-lg font-semibold transition-all ${
            message.includes('✓')
              ? 'bg-green-600 text-white'
              : message.includes('✗')
              ? 'bg-red-600 text-white'
              : 'bg-blue-600 text-white'
          }`}>
            {message}
          </div>
        )}

        {/* Search Users */}
        <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-4">Search Users</h2>
          <p className="text-slate-400 mb-4 font-medium">Find your friends by username</p>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition text-base font-medium"
            />
            {searching && (
              <div className="absolute right-4 top-3 text-slate-400 font-medium">
                Searching...
              </div>
            )}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-8 border-t border-slate-700 pt-6">
              <p className="text-lg text-slate-300 mb-6 font-semibold">
                Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between py-4 px-4 border border-slate-600 rounded-lg mb-3 hover:bg-slate-700/50 hover:shadow-md transition bg-slate-900/50"
                >
                  <div className="flex items-center gap-4">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-100">{user.username}</p>
                      {user.nickname && (
                        <p className="text-sm text-slate-400 font-medium">{user.nickname}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendFriendRequest(user.username)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
                  >
                    Add Friend
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Friend Requests</h2>
            <p className="text-slate-400 mb-8 font-medium text-lg">You have {friendRequests.length} pending request{friendRequests.length !== 1 ? 's' : ''}</p>
            <div className="space-y-4">
              {friendRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-slate-600 rounded-lg bg-slate-900/50 hover:bg-slate-900 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    {request.sender.avatar ? (
                      <img
                        src={request.sender.avatar}
                        alt={request.sender.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-slate-600 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {request.sender.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-100">
                        {request.sender.nickname || request.sender.username}
                      </p>
                      <p className="text-sm text-slate-400 font-medium">@{request.sender.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'accept')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespondToRequest(request.id, 'reject')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {friendRequests.length === 0 && searchQuery === '' && (
          <div className="text-center py-12">
            <p className="text-2xl text-slate-300 font-semibold">No friend requests yet</p>
            <p className="text-slate-400 mt-4 font-medium">Search for users above to send friend requests</p>
          </div>
        )}
      </div>
    </div>
  );
}
