# Zustand Store Fixes

## Issues Fixed

### 1. Chat "Not Found" Error

**Problem:**
When opening a chat, users would see "Chat not found - This conversation or group may no longer exist" even though the chat existed.

**Root Cause:**
- The messages page was using the Zustand store's `conversations` and `groupChats` Maps
- The Sidebar was using local state and fetching independently
- When clicking a chat link, the messages page looked for the conversation in the store, but it wasn't there because:
  1. The Sidebar never populated the Zustand store
  2. The messages page didn't fetch conversations/groups on mount

**Solution:**
1. **Updated messages page** (`app/messages/page.tsx`):
   - Now fetches `conversations` and `groupChats` on mount to populate the store
   - Ensures the Maps are populated before trying to access them

2. **Updated Sidebar** (`app/components/Sidebar.tsx`):
   - Now uses Zustand stores instead of local state
   - Converts Maps to arrays for rendering
   - Removes duplicate SSE handlers (now handled by `useStoreSync`)
   - Ensures consistency across the app

### 2. Feed Type Switching Shows Wrong Data

**Problem:**
Switching between "Friends" feed and "Public" feed would show cached data from the wrong feed type if both were cached.

**Root Cause:**
The feed store had:
- ONE `posts` array for all data
- TWO feed types ('friends' and 'public')
- A cache mechanism per feed type

When switching:
1. `setFeedType('public')` updates the feedType state
2. `fetchPosts('public')` checks if 'public' is cached
3. If cached (< 30 seconds), it returns early **without fetching**
4. BUT the `posts` array still contains 'friends' posts!

**Solution:**
Updated `setFeedType` in `app/stores/feedStore.ts`:
- Now **clears the posts array** when switching feed types
- Immediately **calls fetchPosts** for the new feed type
- This ensures users see fresh data or a loading state instead of stale data from the wrong feed

```typescript
setFeedType: (feedType) => {
  // Clear posts when switching feed types to force fresh data display
  set({ feedType, posts: [] });
  // Immediately fetch posts for the new feed type
  get().fetchPosts(feedType);
},
```

## Session Storage Persistence

### Should We Implement It?

**Pros:**
✅ **Faster page loads** - Data available immediately without API calls
✅ **Offline support** - Users can see cached data even without connection
✅ **Better UX** - No loading spinners for cached data
✅ **Reduced server load** - Fewer API calls on page refresh

**Cons:**
❌ **Stale data risk** - Users might see outdated data after refresh
❌ **Storage limits** - SessionStorage has ~5-10MB limit
❌ **Complexity** - Need invalidation strategy
❌ **Privacy concerns** - Sensitive data persists in browser

### Recommendation

**Yes, but with caveats:**

1. **Selective persistence** - Only persist non-sensitive, frequently accessed data:
   - ✅ Feed posts (public data)
   - ✅ User profile data
   - ❌ Messages (privacy concerns)
   - ❌ Notifications (real-time nature)

2. **Short TTL** - Implement time-to-live (e.g., 5 minutes):
   ```typescript
   interface PersistedState {
     data: any;
     timestamp: number;
     version: string; // For schema migrations
   }
   ```

3. **Invalidation strategy**:
   - Clear on logout
   - Clear on version mismatch
   - Clear on specific mutations

4. **Implementation example**:
   ```typescript
   import { persist } from 'zustand/middleware';
   
   export const useFeedStore = create<FeedState>()(
     devtools(
       persist(
         (set, get) => ({
           // ... store implementation
         }),
         {
           name: 'feed-storage', // sessionStorage key
           storage: createJSONStorage(() => sessionStorage),
           partialize: (state) => ({
             // Only persist specific fields
             posts: state.posts,
             feedType: state.feedType,
             // Don't persist loading states or timestamps
           }),
           version: 1, // Increment to invalidate old cache
         }
       ),
       { name: 'FeedStore' }
     )
   );
   ```

### Best Practice

Start **without** persistence and add it **later if needed**:
- The current caching (10-30 seconds) already reduces server load significantly
- SSE keeps data real-time without persistence
- Add persistence only if you see UX issues with loading times

## Testing the Fixes

### Test Case 1: Chat Opening
1. ✅ Navigate to Messages page
2. ✅ Click on a conversation or group
3. ✅ Should open without "Chat not found" error
4. ✅ Messages should load correctly

### Test Case 2: Feed Switching
1. ✅ Go to Feed page (defaults to "Friends")
2. ✅ Click "Public" tab
3. ✅ Should show loading state or public posts
4. ✅ Should NOT show friends posts
5. ✅ Click "Friends" tab
6. ✅ Should show loading state or friends posts
7. ✅ Should NOT show public posts

### Test Case 3: Real-time Updates
1. ✅ Open two browser windows
2. ✅ Send a message from one window
3. ✅ Should appear in both windows immediately
4. ✅ Unread counts should update in sidebar

## Summary

The fixes ensure:
- ✅ Consistent state management across components
- ✅ Proper cache invalidation on feed switching
- ✅ No more "Chat not found" errors
- ✅ Data fetching happens at the right time
- ✅ SSE updates work correctly with stores

Session storage persistence is **optional** and should be added carefully with proper invalidation strategy if needed for performance optimization.
