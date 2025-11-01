ALTER TABLE `trips` ADD `premiumTier` enum('free','featured','premium') DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE `trips` ADD `premiumExpiresAt` timestamp;