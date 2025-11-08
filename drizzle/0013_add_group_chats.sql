-- Add group chat support to conversations table
ALTER TABLE `conversations`
  MODIFY COLUMN `user1Id` int NULL,
  MODIFY COLUMN `user2Id` int NULL,
  ADD COLUMN `tripId` int NULL,
  ADD COLUMN `isGroup` boolean NOT NULL DEFAULT false,
  ADD COLUMN `title` varchar(255) NULL,
  ADD INDEX `idx_trip` (`tripId`);

-- Drop the unique constraint on user1Id and user2Id since group chats don't use it
ALTER TABLE `conversations`
  DROP INDEX `unique_conversation`;

-- Add new unique constraint only for direct messages (where isGroup = false)
-- Note: MySQL doesn't support partial indexes, so we'll handle uniqueness in application logic
