CREATE TABLE `line_accounts` (
	`userId` int NOT NULL,
	`lineUserId` varchar(64) NOT NULL,
	`linkedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `line_accounts_userId` PRIMARY KEY(`userId`),
	CONSTRAINT `line_accounts_lineUserId_unique` UNIQUE(`lineUserId`)
);
--> statement-breakpoint
ALTER TABLE `line_accounts` ADD CONSTRAINT `line_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;