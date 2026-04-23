CREATE TABLE `email_tracking_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackingToken` varchar(64) NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`emailIndex` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`eventType` enum('open','click') NOT NULL,
	`linkUrl` varchar(2048),
	`ip` varchar(64),
	`userAgent` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_tracking_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracked_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`campaignId` int NOT NULL,
	`userId` int NOT NULL,
	`emailIndex` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`trackingToken` varchar(64) NOT NULL,
	`subject` varchar(512) NOT NULL,
	`bodyHtml` text NOT NULL,
	`bodyText` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracked_emails_id` PRIMARY KEY(`id`),
	CONSTRAINT `tracked_emails_trackingToken_unique` UNIQUE(`trackingToken`)
);
