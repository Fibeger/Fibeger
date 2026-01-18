# SSE Subscription Optimization

## Problem

Previously, when navigating between pages (e.g., switching from feed to friends), all SSE event subscriptions were being torn down and re-created. This was visible in console logs showing repeated unsubscribe/resubscribe messages:

```
[RealtimeClient] 👂 Subscribed to 'notification' events (2 listeners)
[RealtimeClient] 👂 Subscribed to 'message' events (3 listeners)
[RealtimeClient] 🔇 Unsubscribed from 'notification' events (1 listeners remaining)
[RealtimeClient] 🔇 Unsubscribed from 'message' events (2 listeners remaining)
[RealtimeClient] 👂 Subscribed to 'notification' events (2 listeners)
[RealtimeClient] 👂 Subscribed to 'message' events (3 listeners)
```

This happened because React `useEffect` hooks were re-running on every navigation due to unstable dependencies.

## Root Cause

The issue was caused by unstable dependencies in `useEffect` hooks across multiple components:

1. **`useStoreSync.ts`** - Included entire Zustand store objects in dependencies
2. **`Sidebar.tsx`** - Included `fetchConversations` and `fetchGroupChats` functions
3. **`BrowserNotifications.tsx`** - Included `pathname` and `searchParams` as dependencies
4. **`useBrowserNotifications.ts`** - Included `showNotification` callback
5. **`NotificationBell.tsx`** - Included `fetchNotifications` function

Even though Zustand stores are stable, passing them as dependencies or using their methods directly caused the effects to re-run on every render.

## Solution

### 1. Stabilize Store Dependencies

**Before:**
```typescript
useEffect(() => {
  const unsubscribe = on('notification', (event) => {
    notificationsStore.addNotification(event.data.notification);
  });
  return unsubscribe;
}, [on, notificationsStore, messagesStore, feedStore, friendsStore]);
```

**After:**
```typescript
useEffect(() => {
  const unsubscribe = on('notification', (event) => {
    notificationsStore.addNotification(event.data.notification);
  });
  return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [on]); // Only depend on 'on' - stores are stable Zustand stores
```

### 2. Use Store's `getState()` for Dynamic Access

Instead of passing store methods as dependencies, access them dynamically:

**Before:**
```typescript
useEffect(() => {
  const unsubscribe = on('conversation_update', () => {
    fetchConversations();
  });
  return unsubscribe;
}, [on, fetchConversations, fetchGroupChats]);
```

**After:**
```typescript
useEffect(() => {
  const unsubscribe = on('conversation_update', () => {
    useMessagesStore.getState().fetchConversations();
  });
  return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [on]); // Only depend on 'on'
```

### 3. Read Route Info Dynamically

For components that need to react to route changes WITHOUT re-subscribing:

**Before:**
```typescript
useEffect(() => {
  const handleMessage = (event) => {
    if (pathname === '/messages') {
      // Check current route...
    }
  };
  return on('message', handleMessage);
}, [on, pathname, searchParams]); // Re-subscribes on every navigation!
```

**After:**
```typescript
useEffect(() => {
  const handleMessage = (event) => {
    // Read route info dynamically inside the handler
    const currentPathname = window.location.pathname;
    const currentSearchParams = new URLSearchParams(window.location.search);
    
    if (currentPathname === '/messages') {
      // Check current route...
    }
  };
  return on('message', handleMessage);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [on]); // Only re-subscribe if 'on' changes (which it doesn't)
```

## Benefits

✅ **Performance**: Subscriptions are now set up only ONCE when components mount
✅ **Efficiency**: No unnecessary unsubscribe/resubscribe cycles on navigation
✅ **Stability**: SSE connection remains stable across route changes
✅ **Reduced console noise**: Cleaner console logs without repeated subscription messages

## Files Modified

- `app/hooks/useStoreSync.ts` - Removed store dependencies
- `app/components/Sidebar.tsx` - Use `getState()` for dynamic access
- `app/components/BrowserNotifications.tsx` - Read route info dynamically
- `app/components/NotificationBell.tsx` - Removed function dependencies
- `app/hooks/useBrowserNotifications.ts` - Removed callback dependencies

## Testing

After these changes, when navigating between pages:

1. Open the browser console
2. Navigate from `/feed` to `/friends` and back
3. You should see subscriptions remain stable with NO unsubscribe/resubscribe messages
4. Real-time features should still work perfectly (notifications, messages, etc.)

## Technical Notes

### Why This Works

1. **Zustand stores are singletons**: Once created, they maintain the same reference
2. **`getState()` is always fresh**: Calling it inside a callback ensures you get the latest state and methods
3. **`window.location` is always current**: Reading it inside event handlers gives you the current route without needing it as a dependency
4. **The `on` function from `useRealtimeEvents` is stable**: It's memoized with `useCallback` and doesn't change

### Best Practices Going Forward

When adding new SSE subscriptions:

1. ✅ DO only depend on the `on` function
2. ✅ DO use `storeInstance.getState().method()` for dynamic access
3. ✅ DO read `window.location` inside event handlers if needed
4. ❌ DON'T add store objects to dependencies
5. ❌ DON'T add store methods to dependencies
6. ❌ DON'T add route info (`pathname`, `searchParams`) to dependencies

### ESLint Rule Suppression

We've added `// eslint-disable-next-line react-hooks/exhaustive-deps` comments to these effects because:

1. We understand the implications of the reduced dependencies
2. The stores are stable singletons (Zustand's design)
3. Dynamic access patterns ensure we always get fresh state
4. The alternative (including all dependencies) causes the performance problem we're solving

This is an intentional design decision, not a hack or workaround.
