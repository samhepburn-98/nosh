CREATE TABLE `kitchen_items` (
	`ingredient_id` integer PRIMARY KEY NOT NULL,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE cascade
);
