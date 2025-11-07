-- Create conversations table
CREATE TABLE `conversations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user1Id` int NOT NULL,
  `user2Id` int NOT NULL,
  `lastMessageAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user1` (`user1Id`),
  INDEX `idx_user2` (`user2Id`),
  UNIQUE KEY `unique_conversation` (`user1Id`, `user2Id`)
);

-- Create messages table
CREATE TABLE `messages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `conversationId` int NOT NULL,
  `senderId` int NOT NULL,
  `receiverId` int NOT NULL,
  `content` text NOT NULL,
  `isRead` boolean NOT NULL DEFAULT false,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_conversation` (`conversationId`),
  INDEX `idx_sender` (`senderId`),
  INDEX `idx_receiver` (`receiverId`),
  FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE
);
