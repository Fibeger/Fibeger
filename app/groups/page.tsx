'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface User {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

interface Message {
  id: number;
  content: string;
  sender: User;
  createdAt: string;
}

interface GroupChat {
  id: number;
  name: string;
  description: string | null;
  avatar: string | null;
  members: { user: User; role: string }[];
  messages: Message[];
}

export default function GroupChatsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<GroupChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchGroupChats();
    const interval = setInterval(fetchGroupChats, 3000);

    return () => clearInterval(interval);
  }, [session, router]);

  const fetchGroupChats = async () => {
    try {
      const res = await fetch('/api/groupchats');
      if (res.ok) {
        const data = await res.json();
        setGroupChats(data);
      }
    } catch (error) {
      console.error('Failed to load group chats');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (groupChatId: number) => {
    try {
      const res = await fetch(`/api/groupchats/${groupChatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const handleSelectChat = (chat: GroupChat) => {
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    try {
      const res = await fetch(
        `/api/groupchats/${selectedChat.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedChat.id);
      }
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/groupchats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          description: newGroupDesc,
        }),
      });

      if (res.ok) {
        setNewGroupName('');
        setNewGroupDesc('');
        setShowCreateForm(false);
        fetchGroupChats();
      }
    } catch (error) {
      console.error('Failed to create group');
    }
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"><p className="text-xl font-semibold text-slate-400">Loading groups...</p></div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Group List */}
      <div className="w-64 sm:w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col shadow-lg">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-bold text-slate-100 mb-3">Groups</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
          >
            {showCreateForm ? 'Cancel' : 'New Group'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateGroup} className="p-4 border-b border-slate-700 space-y-3 bg-slate-800">
            <input
              type="text"
              placeholder="Group name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 font-medium"
              required
            />
            <textarea
              placeholder="Description (optional)"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-600 rounded-lg text-sm bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 font-medium"
              rows={2}
            />
            <button
              type="submit"
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition shadow-md"
            >
              Create
            </button>
          </form>
        )}

        <div className="flex-1 overflow-y-auto">
          {groupChats.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-slate-400 font-medium">No groups yet</p>
              <p className="text-slate-500 text-sm font-medium mt-2">Create one to get started</p>
            </div>
          ) : (
            groupChats.map((chat) => {
              const lastMessage = chat.messages[0];

              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition ${
                    selectedChat?.id === chat.id ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-100">{chat.name}</p>
                  {chat.members && (
                    <p className="text-xs text-slate-400 font-medium">
                      {chat.members.length} members
                    </p>
                  )}
                  {lastMessage && (
                    <p className="text-xs text-slate-400 truncate">
                      {lastMessage.content}
                    </p>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 shadow-md">
              <h2 className="font-bold text-lg text-slate-100">{selectedChat.name}</h2>
              <p className="text-sm text-slate-400 font-medium">{selectedChat.members.length} members</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  {msg.sender.avatar && (
                    <img
                      src={msg.sender.avatar}
                      alt={msg.sender.username}
                      className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-slate-600 shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <p className="font-semibold text-sm text-slate-100">
                        {msg.sender.nickname || msg.sender.username}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm break-words text-slate-300 font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-slate-800 border-t border-slate-700 flex gap-3 shadow-md"
            >
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-600 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-600 transition font-medium"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold shadow-md"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-slate-300">No group selected</p>
            <p className="text-slate-400 mt-4 font-medium">Create a group or select one from the list</p>
          </div>
        )}
      </div>
    </div>
  );
}
