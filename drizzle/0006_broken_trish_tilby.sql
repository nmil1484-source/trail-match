CREATE TABLE `shopReviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`userId` int NOT NULL,
	`rating` int NOT NULL,
	`reviewText` text,
	`serviceType` varchar(100),
	`wouldRecommend` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopReviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`addedBy` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('mechanic','fabrication','parts','tires','suspension','general') NOT NULL,
	`address` text,
	`city` varchar(100),
	`state` varchar(50),
	`zipCode` varchar(20),
	`phone` varchar(50),
	`email` varchar(320),
	`website` text,
	`averageRating` int DEFAULT 0,
	`totalReviews` int DEFAULT 0,
	`photos` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
