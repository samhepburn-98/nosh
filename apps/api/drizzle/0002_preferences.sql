CREATE TABLE `preferences` (
	`id` integer PRIMARY KEY NOT NULL,
	`dietary` text NOT NULL,
	CONSTRAINT "preferences_single_row" CHECK("preferences"."id" = 1)
);
