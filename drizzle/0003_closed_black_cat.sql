CREATE TABLE `income_calculators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clientCount` int NOT NULL DEFAULT 0,
	`monthlyRetainerCzk` int NOT NULL DEFAULT 10000,
	`totalMonthlyRevenue` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `income_calculators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `niche_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`averagePrice` int NOT NULL,
	`recommendedSolution` varchar(512) NOT NULL,
	`bestOutreachPlatform` varchar(128) NOT NULL,
	`aiPromptContext` text NOT NULL,
	`icon` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `niche_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `niche_templates_slug_unique` UNIQUE(`slug`)
);
