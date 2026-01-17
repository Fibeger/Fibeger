'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

interface Conversation {
  id: number;
  members: { user: User }[];
  messages: Message[];
}

export default function DMsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchConversations();
    const interval = setInterval(fetchConversations, 3000);

    return () => clearInterval(interval);
  }, [session, router]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: number) => {
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to load messages');
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      const res = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage }),
        }
      );

      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  const getOtherUser = (conversation: Conversation): User | null => {
    const userId = parseInt((session?.user as any)?.id || '0');
    return conversation.members.find((m) => m.user.id !== userId)?.user || null;
  };

  if (loading) return <div className="p-8 flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"><p className="text-xl font-semibold text-slate-400">Loading messages...</p></div>;

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Conversations List */}
      <div className="w-64 sm:w-80 bg-slate-800/50 border-r border-slate-700 flex flex-col shadow-lg">
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <h1 className="text-xl font-bold text-slate-100">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-slate-400 font-medium">No conversations yet</p>
              <Link
                href="/friends"
                className="text-blue-400 hover:text-blue-300 font-semibold text-sm transition"
              >
                Find friends to chat
              </Link>
            </div>
          ) : (
            conversations.map((conv) => {
              const otherUser = getOtherUser(conv);
              const lastMessage = conv.messages[0];

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left border-b border-slate-700 hover:bg-slate-700/50 transition ${
                    selectedConversation?.id === conv.id ? 'bg-slate-700 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {otherUser?.avatar && (
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.username}
                        className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate text-slate-100">
                        {otherUser?.nickname || otherUser?.username}
                      </p>
                      {lastMessage && (
                        <p className="text-xs text-slate-400 truncate">
                          {lastMessage.content}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-900/50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-3 shadow-md">
              {getOtherUser(selectedConversation)?.avatar && (
                <img
                  src={getOtherUser(selectedConversation)!.avatar || ''}
                  alt=""
                  className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md"
                />
              )}
              <div>
                <p className="font-semibold text-lg text-slate-100">
                  {getOtherUser(selectedConversation)?.nickname ||
                    getOtherUser(selectedConversation)?.username}
                </p>
                <p className="text-sm text-slate-400">
                  @{getOtherUser(selectedConversation)?.username}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender.id === parseInt((session?.user as any)?.id || '0')
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg shadow-md font-medium ${
                      msg.sender.id === parseInt((session?.user as any)?.id || '0')
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}
                  >
                    <p className="break-words">{msg.content}</p>
                    <p className={`text-xs mt-2 font-semibold ${msg.sender.id === parseInt((session?.user as any)?.id || '0') ? 'text-blue-100' : 'text-slate-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
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
            <p className="text-2xl font-bold text-slate-300">No chat selected</p>
            <p className="text-slate-400 mt-4 font-medium">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
