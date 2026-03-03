CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`prospect_id` integer NOT NULL,
	`content` text NOT NULL,
	`edited_content` text,
	`generated_at` text NOT NULL,
	FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `prospects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text NOT NULL,
	`name` text,
	`bio` text,
	`followers` integer,
	`email` text,
	`website` text,
	`last_post` text,
	`source` text DEFAULT 'instagram',
	`status` text DEFAULT 'new' NOT NULL,
	`message_status` text DEFAULT 'none' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `prospects_username_unique` ON `prospects` (`username`);--> statement-breakpoint
CREATE TABLE `search_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`hashtags` text,
	`target_profiles` text,
	`bio_keywords` text,
	`location` text,
	`created_at` text NOT NULL
);
