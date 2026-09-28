CREATE TABLE `plan_entries` (
	`id` integer PRIMARY KEY NOT NULL,
	`day` integer NOT NULL,
	`recipe_id` integer NOT NULL,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "plan_entries_day" CHECK("plan_entries"."day" between 1 and 7)
);
