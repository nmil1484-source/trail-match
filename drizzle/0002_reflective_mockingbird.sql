ALTER TABLE `trips` ADD `vehicleRequirement` enum('2wd','4x4_stock','4x4_modded','2wd_prerunner','4wd_prerunner','raptor','long_travel_fast','long_travel_slow');--> statement-breakpoint
ALTER TABLE `vehicles` ADD `modsList` text;--> statement-breakpoint
ALTER TABLE `trips` DROP COLUMN `minBuildLevel`;