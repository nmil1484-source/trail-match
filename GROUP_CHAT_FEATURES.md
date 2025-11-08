# Group Chat & Multiple Requirements Features

## Overview
This update adds trip-based group messaging and improves the trip creation experience by allowing multiple vehicle requirements to be selected.

## Features Implemented

### 1. Trip Group Chat 💬

**What it does:**
- Creates a dedicated group chat for each trip
- Only trip organizer and accepted participants can access
- Real-time messaging with auto-refresh every 5 seconds
- Messages are linked to the trip they're about

**Where it appears:**
- Trip detail pages (for organizer and accepted participants)
- Clean, card-based UI with message history
- Shows sender name and timestamp for each message

**How it works:**
- Group chat is automatically created when first message is sent
- All participants can see all messages
- Messages update in real-time without page refresh
- Scroll automatically goes to latest message

**Technical details:**
- Database schema updated with `tripId`, `isGroup`, and `title` fields
- Backend endpoints: `getTripGroupChat`, `getTripGroupMessages`, `sendTripGroupMessage`
- Access control: Only participants can view/send messages
- Uses tRPC for type-safe API calls

### 2. Multiple Vehicle Requirements ✅

**What changed:**
- Vehicle Requirements dropdown → Multiple checkboxes
- Can now select multiple requirements (e.g., "4x4 Stock" + "4x4 with Mods")
- Better represents real-world trip requirements

**Where it appears:**
- Trip creation form (Post Trip page)
- Organized in a 2-column grid layout
- Clear label: "Vehicle Requirements (select all that apply)"

**Options available:**
- 2WD Needed
- 4x4 Stock
- 4x4 with Mods
- 2WD Pre-Runner
- 4WD Pre-Runner
- Raptor
- Long Travel (Fast)
- Long Travel (Slow)

**Technical details:**
- Changed from `vehicleRequirement: string` to `vehicleRequirements: string[]`
- Form submission sends array of selected requirements
- Database stores as JSON array

## Database Changes

### Schema Updates (schema.ts)
```typescript
conversations table:
- user1Id: int (nullable for group chats)
- user2Id: int (nullable for group chats)
- tripId: int (links conversation to trip)
- isGroup: boolean (true for trip group chats)
- title: varchar(255) (e.g., "Mojave Road - Group Chat")
```

### Migration SQL (0013_add_group_chats.sql)
- Makes user1Id and user2Id nullable
- Adds tripId, isGroup, and title columns
- Adds index on tripId for performance
- Removes unique constraint (not needed for group chats)

## New Backend Functions

### db.ts
- `getOrCreateTripGroupChat(tripId)` - Get or create group chat for trip
- `getTripGroupMessages(tripId)` - Get all messages in trip group chat
- `sendTripGroupMessage(tripId, senderId, content)` - Send message to group
- `isUserTripParticipant(userId, tripId)` - Check if user can access chat

### routers.ts
- `messages.getTripGroupChat` - tRPC endpoint
- `messages.getTripGroupMessages` - tRPC endpoint
- `messages.sendTripGroupMessage` - tRPC endpoint

All endpoints verify user is participant before allowing access.

## New UI Components

### TripGroupChat.tsx
- Standalone group chat component
- Message list with sender names and timestamps
- Input field with send button
- Auto-scroll to latest message
- Auto-refresh every 5 seconds
- Loading states and error handling

## Migration Required

**IMPORTANT:** Before group chat will work, you must run the database migration:

1. Go to: `/admin/migrate-messaging` (creates conversations/messages tables)
2. Then manually run this SQL or create a new migration page:
```sql
ALTER TABLE `conversations`
  MODIFY COLUMN `user1Id` int NULL,
  MODIFY COLUMN `user2Id` int NULL,
  ADD COLUMN `tripId` int NULL,
  ADD COLUMN `isGroup` boolean NOT NULL DEFAULT false,
  ADD COLUMN `title` varchar(255) NULL,
  ADD INDEX `idx_trip` (`tripId`);

ALTER TABLE `conversations`
  DROP INDEX `unique_conversation`;
```

## User Benefits

### For Trip Organizers:
- Communicate with all participants at once
- Share last-minute updates, meeting points, etc.
- Build group cohesion before the trip
- Better specify vehicle requirements

### For Participants:
- Ask questions to the whole group
- Coordinate with other participants
- Get to know your trip mates
- See exactly what vehicles are acceptable

### For Everyone:
- Clearer trip requirements
- Better pre-trip communication
- Reduced need for external messaging apps
- Trip context always visible in messages

## Files Changed

### Backend:
- `drizzle/schema.ts` - Updated conversations schema
- `drizzle/0013_add_group_chats.sql` - Migration SQL
- `server/db.ts` - Added group chat functions
- `server/routers.ts` - Added group chat endpoints

### Frontend:
- `client/src/components/TripGroupChat.tsx` - New component
- `client/src/pages/TripDetail.tsx` - Added group chat
- `client/src/pages/PostTrip.tsx` - Checkboxes for requirements

## Next Steps

1. Run database migration
2. Test group chat on a trip
3. Verify multiple vehicle requirements work
4. Consider adding:
   - Unread message indicators for group chats
   - Push notifications for new group messages
   - File/image sharing in group chats
   - @mentions in group messages
