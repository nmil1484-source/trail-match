CREATE TABLE `tripParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tripId` int NOT NULL,
	`userId` int NOT NULL,
	`vehicleId` int NOT NULL,
	`status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
	`message` text,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tripParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizerId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`location` varchar(255) NOT NULL,
	`state` varchar(50),
	`startDate` timestamp NOT NULL,
	`endDate` timestamp NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced','expert') NOT NULL,
	`styles` json,
	`maxParticipants` int DEFAULT 6,
	`currentParticipants` int DEFAULT 1,
	`minTireSize` varchar(50),
	`requiresWinch` boolean DEFAULT false,
	`requiresLockers` boolean DEFAULT false,
	`minBuildLevel` enum('stock','mild','moderate','heavy'),
	`photos` json,
	`itinerary` text,
	`campingInfo` text,
	`status` enum('open','full','completed','cancelled') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `trips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`make` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`buildLevel` enum('stock','mild','moderate','heavy') NOT NULL DEFAULT 'stock',
	`liftHeight` varchar(50),
	`tireSize` varchar(50),
	`hasWinch` boolean DEFAULT false,
	`hasLockers` boolean DEFAULT false,
	`hasArmor` boolean DEFAULT false,
	`hasSuspensionUpgrade` boolean DEFAULT false,
	`modifications` json,
	`photos` json,
	`capabilityScore` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `experienceLevel` enum('beginner','intermediate','advanced','expert');--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePhoto` text;