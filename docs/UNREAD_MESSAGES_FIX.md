# Unread Messages Indicator - Real-time Updates Fix

## Problem
The unread message indicators in the sidebar were not updating instantly when:
1. ❌ Messages were marked as read - the badge stayed visible until page refresh or new message
2. ⚠️ New messages arrived - there was a slight delay

## Root Cause
The application **does use the event-based SSE system**, but it was incomplete:
- ✅ New messages triggered `conversation_update` events
- ❌ Marking messages as read did NOT emit any events
- ⚠️ Sidebar only updated on events, not optimistically

## Solution Implemented

### 1. Mark-as-Read Events (`app/api/messages/mark-read/route.ts`)
**Added SSE event emissions when messages are marked as read:**

```typescript
// After updating lastReadMessageId in database
// Emit conversation_update event to all members (including self)
const allMembers = await prisma.conversationMember.findMany({
  where: { conversationId: convId },
  select: { userId: true },
});
allMembers.forEach((member) => {
  eventManager.emit(member.userId, 'conversation_update', {
    conversationId: convId,
    readBy: userId,
  });
});
```

**Result**: When you read messages, all conversation members (including yourself) get instant sidebar updates.

### 2. Optimistic Unread Count Updates (`app/components/Sidebar.tsx`)
**Added `message` event listener for instant local updates:**

```typescript
const handleMessage = (event: any) => {
  const { conversationId, groupChatId, message } = event.data;
  const currentUserId = parseInt((session?.user as any)?.id || '0');

  // Don't update unread count for own messages
  if (message?.sender?.id === currentUserId) return;

  // Update conversation unread count locally (optimistic update)
  if (conversationId) {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: (conv.unreadCount || 0) + 1 }
          : conv
      )
    );
  }
  // Similar for group chats...
};
```

**Result**: The unread badge appears INSTANTLY when a new message arrives, even before the server refetch confirms it.

## How It Works Now

### Scenario 1: New Message Arrives
```
1. User A sends message
   ↓
2. Server emits 'message' event to User B
   ↓
3. Sidebar sees event → Increments unread count INSTANTLY (optimistic)
   ↓
4. Server also emits 'conversation_update' event
   ↓
5. Sidebar refetches → Confirms accurate count
```

### Scenario 2: User Reads Messages
```
1. User opens conversation
   ↓
2. Messages marked as read via API
   ↓
3. Server emits 'conversation_update' event to ALL members
   ↓
4. Sidebar sees event → Refetches conversations
   ↓
5. Unread badge CLEARS INSTANTLY
```

## Benefits

✅ **Instant Updates** - No more stale unread badges
✅ **Works for Both DMs and Groups** - Consistent behavior
✅ **Two-Layer Update System**:
  - Layer 1: Optimistic local update (instant, may have race conditions)
  - Layer 2: Server confirmation refetch (accurate, authoritative)
✅ **All Users See Updates** - When someone reads messages, everyone's sidebar updates
✅ **Uses Existing SSE Infrastructure** - No new websocket needed

## Testing Checklist

- [ ] Send a message in DM → Badge appears instantly on recipient
- [ ] Open the DM → Badge clears instantly
- [ ] Send a message in group → Badge appears instantly for all members
- [ ] Open the group → Badge clears instantly
- [ ] Multiple rapid messages → Unread count increments correctly
- [ ] Read messages in one tab → Badge clears in other tabs (same user)
- [ ] Network reconnection → Events still work after SSE reconnect
