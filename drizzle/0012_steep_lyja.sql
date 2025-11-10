CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user1Id` int,
	`user2Id` int,
	`tripId` int,
	`isGroup` boolean NOT NULL DEFAULT false,
	`title` varchar(255),
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tripReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`organizerId` int NOT NULL,
	`rating` int NOT NULL,
	`reviewText` text,
	`organizationRating` int,
	`communicationRating` int,
	`wouldJoinAgain` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `shops` ADD `isVerified` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `shops` ADD `verifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `shops` ADD `verifiedBy` int;--> statement-breakpoint
ALTER TABLE `shops` ADD `premiumTier` enum('none','featured','premium') DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `shops` ADD `premiumExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `tripParticipants` ADD `denialReason` text;--> statement-breakpoint
ALTER TABLE `trips` ADD `isPrivate` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `shareToken` varchar(64);