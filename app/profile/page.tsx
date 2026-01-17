'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  nickname: string | null;
  bio: string | null;
  avatar: string | null;
  lastUsernameChange: string | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    newUsername: '',
  });

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchProfile();
  }, [session, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          nickname: data.nickname || '',
          bio: data.bio || '',
          newUsername: '',
        });
      }
    } catch (error) {
      setMessage('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: formData.nickname,
          bio: formData.bio,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setMessage('Profile updated successfully');
        setEditing(false);
      } else {
        setMessage('Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please upload an image file');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('avatar', file);

      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formDataToSend,
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setMessage('Profile picture updated successfully');
      } else {
        const error = await res.json();
        setMessage(error.error || 'Failed to upload image');
      }
    } catch (error) {
      setMessage('Error uploading image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newUsername.trim()) {
      setMessage('New username is required');
      return;
    }

    try {
      const res = await fetch('/api/profile/username', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newUsername: formData.newUsername }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.user);
        setFormData({ ...formData, newUsername: '' });
        setMessage('Username changed successfully');
      } else {
        const error = await res.json();
        setMessage(error.error || 'Failed to change username');
      }
    } catch (error) {
      setMessage('Error changing username');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'var(--text-primary)' }}></div>
        <p className="mt-6 text-xl font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
      </div>
    </div>
  );

  const canChangeUsername =
    !profile?.lastUsernameChange ||
    new Date(profile.lastUsernameChange).getTime() + 7 * 24 * 60 * 60 * 1000 <
      Date.now();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {message && (
          <div 
            className={`mb-6 p-4 rounded-lg font-semibold shadow-lg transition-all border ${
              message.includes('successfully')
                ? 'border-green-500'
                : message.includes('Failed') || message.includes('Error') || message.includes('must be')
                ? 'border-red-500'
                : 'border-blue-500'
            }`}
            style={{
              backgroundColor: message.includes('successfully') ? 'var(--hover-bg)' : 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
            }}
          >
            {message}
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div 
              className="rounded-xl shadow-lg border p-8"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                {/* Avatar Section */}
                <div className="flex-shrink-0">
                  <div className="relative group">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.username}
                        className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer shadow-lg transition hover:shadow-lg font-semibold">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                      📷
                    </label>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-semibold">Click to change</p>
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
                    {profile.nickname || profile.username}
                  </h1>
                  <p className="text-lg text-slate-400 mt-1 font-semibold">@{profile.username}</p>
                  <p className="text-slate-300 mt-3 text-base font-medium">{profile.bio || 'No bio yet'}</p>
                  <p className="text-sm text-slate-500 mt-4 font-medium">{profile.email}</p>
                </div>

                {editing ? (
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold shadow-md"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-md"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Edit Profile Form */}
            {editing && (
              <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 p-8">
                <h2 className="text-2xl font-bold text-slate-100 mb-6">Edit Profile</h2>
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) =>
                        setFormData({ ...formData, nickname: e.target.value })
                      }
                      placeholder="Your display name"
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Tell us about yourself..."
                      className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition font-medium"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold shadow-md"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold shadow-md"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Change Username */}
            <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 p-8">
              <h2 className="text-2xl font-bold text-slate-100 mb-2">
                Change Username
              </h2>
              <p className="text-slate-400 text-sm mb-6 font-medium">
                You can change your username once every 7 days.
              </p>

              {!canChangeUsername && profile.lastUsernameChange && (
                <div className="mb-6 p-4 bg-amber-600/20 border border-amber-600 rounded-lg">
                  <p className="text-amber-300 font-semibold">
                    Available in {Math.ceil(
                      (new Date(profile.lastUsernameChange).getTime() +
                        7 * 24 * 60 * 60 * 1000 -
                        Date.now()) /
                        (24 * 60 * 60 * 1000)
                    )}{' '}
                    day(s)
                  </p>
                </div>
              )}

              <form onSubmit={handleUsernameChange} className="space-y-4">
                <input
                  type="text"
                  placeholder="New username"
                  value={formData.newUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, newUsername: e.target.value })
                  }
                  disabled={!canChangeUsername}
                  className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!canChangeUsername}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition font-semibold shadow-md"
                >
                  {canChangeUsername ? 'Change Username' : 'Cooldown Active'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
