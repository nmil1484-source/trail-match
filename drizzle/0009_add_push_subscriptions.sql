-- Add push subscriptions table for web push notifications
CREATE TABLE `pushSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`keys` json NOT NULL,
	`tripNotifications` boolean NOT NULL DEFAULT true,
	`messageNotifications` boolean NOT NULL DEFAULT true,
	`tripUpdateNotifications` boolean NOT NULL DEFAULT true,
	`reminderNotifications` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pushSubscriptions_id` PRIMARY KEY(`id`)
);
