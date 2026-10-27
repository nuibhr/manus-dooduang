CREATE TABLE `fortune_readings` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`discipline` varchar(32) NOT NULL,
	`topic` varchar(120) NOT NULL,
	`question` text,
	`selectedItems` json,
	`sassyLevel` varchar(16) NOT NULL,
	`depthTier` enum('quick','standard','deep_soul') NOT NULL,
	`coinsSpent` int NOT NULL,
	`markdownContent` text,
	`providerModel` varchar(64),
	`fallback` boolean NOT NULL DEFAULT false,
	`errorCode` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `fortune_readings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_events` (
	`stripeEventId` varchar(255) NOT NULL,
	`eventType` varchar(128) NOT NULL,
	`objectId` varchar(255),
	`livemode` boolean NOT NULL,
	`status` enum('received','processed','ignored','failed') NOT NULL DEFAULT 'received',
	`errorMessage` varchar(500),
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `payment_events_stripeEventId` PRIMARY KEY(`stripeEventId`)
);
--> statement-breakpoint
CREATE TABLE `payment_orders` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`sku` varchar(64) NOT NULL,
	`provider` enum('stripe') NOT NULL DEFAULT 'stripe',
	`status` enum('pending','checkout_created','paid','failed','expired','refunded') NOT NULL DEFAULT 'pending',
	`amountSatang` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`credits` int NOT NULL,
	`idempotencyKey` varchar(191) NOT NULL,
	`stripeCheckoutSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`failureReason` varchar(255),
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_orders_idempotency_uq` UNIQUE(`idempotencyKey`),
	CONSTRAINT `payment_orders_stripe_session_uq` UNIQUE(`stripeCheckoutSessionId`)
);
--> statement-breakpoint
CREATE TABLE `reward_claims` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`claimType` enum('daily_checkin','social_share') NOT NULL,
	`periodKey` varchar(16) NOT NULL,
	`amount` int NOT NULL,
	`streakDay` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reward_claims_id` PRIMARY KEY(`id`),
	CONSTRAINT `reward_claim_user_period_uq` UNIQUE(`userId`,`claimType`,`periodKey`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`userId` int NOT NULL,
	`birthDate` varchar(10),
	`birthTime` varchar(5),
	`birthTimeUnknown` boolean NOT NULL DEFAULT false,
	`consentVersion` varchar(32),
	`consentedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wallet_accounts` (
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`version` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallet_accounts_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
CREATE TABLE `wallet_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`direction` enum('credit','debit') NOT NULL,
	`amount` int NOT NULL,
	`balanceAfter` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`referenceType` varchar(64) NOT NULL,
	`referenceId` varchar(128) NOT NULL,
	`idempotencyKey` varchar(191) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wallet_ledger_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_ledger_idempotency_uq` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
ALTER TABLE `fortune_readings` ADD CONSTRAINT `fortune_readings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_orders` ADD CONSTRAINT `payment_orders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reward_claims` ADD CONSTRAINT `reward_claims_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallet_accounts` ADD CONSTRAINT `wallet_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wallet_ledger` ADD CONSTRAINT `wallet_ledger_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `fortune_readings_user_created_idx` ON `fortune_readings` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `fortune_readings_user_status_idx` ON `fortune_readings` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `payment_events_object_type_idx` ON `payment_events` (`objectId`,`eventType`);--> statement-breakpoint
CREATE INDEX `payment_orders_user_created_idx` ON `payment_orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `reward_claim_user_created_idx` ON `reward_claims` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `wallet_ledger_user_created_idx` ON `wallet_ledger` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `wallet_ledger_reference_idx` ON `wallet_ledger` (`referenceType`,`referenceId`);