import {
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

/** Canonical application identity populated by Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/** One verified LINE identity may be linked to one canonical Manus user. */
export const lineAccounts = mysqlTable("line_accounts", {
  userId: int("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  lineUserId: varchar("lineUserId", { length: 64 }).notNull().unique(),
  linkedAt: timestamp("linkedAt").defaultNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
  userId: int("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  birthDate: varchar("birthDate", { length: 10 }),
  birthTime: varchar("birthTime", { length: 5 }),
  birthTimeUnknown: boolean("birthTimeUnknown").default(false).notNull(),
  consentVersion: varchar("consentVersion", { length: 32 }),
  consentedAt: timestamp("consentedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** One authoritative wallet per canonical user. */
export const walletAccounts = mysqlTable("wallet_accounts", {
  userId: int("userId")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  balance: int("balance").default(0).notNull(),
  version: int("version").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/** Append-only financial-value audit trail. Amount is always positive. */
export const walletLedger = mysqlTable(
  "wallet_ledger",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    direction: mysqlEnum("direction", ["credit", "debit"]).notNull(),
    amount: int("amount").notNull(),
    balanceAfter: int("balanceAfter").notNull(),
    reason: varchar("reason", { length: 255 }).notNull(),
    referenceType: varchar("referenceType", { length: 64 }).notNull(),
    referenceId: varchar("referenceId", { length: 128 }).notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull(),
    metadata: json("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("wallet_ledger_idempotency_uq").on(table.idempotencyKey),
    index("wallet_ledger_user_created_idx").on(table.userId, table.createdAt),
    index("wallet_ledger_reference_idx").on(table.referenceType, table.referenceId),
  ],
);

export const fortuneReadings = mysqlTable(
  "fortune_readings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
    discipline: varchar("discipline", { length: 32 }).notNull(),
    topic: varchar("topic", { length: 120 }).notNull(),
    question: text("question"),
    selectedItems: json("selectedItems").$type<unknown>(),
    sassyLevel: varchar("sassyLevel", { length: 16 }).notNull(),
    depthTier: mysqlEnum("depthTier", ["quick", "standard", "deep_soul"]).notNull(),
    coinsSpent: int("coinsSpent").notNull(),
    markdownContent: text("markdownContent"),
    providerModel: varchar("providerModel", { length: 64 }),
    fallback: boolean("fallback").default(false).notNull(),
    errorCode: varchar("errorCode", { length: 64 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  table => [
    index("fortune_readings_user_created_idx").on(table.userId, table.createdAt),
    index("fortune_readings_user_status_idx").on(table.userId, table.status),
  ],
);

export const rewardClaims = mysqlTable(
  "reward_claims",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    claimType: mysqlEnum("claimType", ["daily_checkin", "social_share"]).notNull(),
    periodKey: varchar("periodKey", { length: 16 }).notNull(),
    amount: int("amount").notNull(),
    streakDay: int("streakDay"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("reward_claim_user_period_uq").on(table.userId, table.claimType, table.periodKey),
    index("reward_claim_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const paymentOrders = mysqlTable(
  "payment_orders",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("userId")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    sku: varchar("sku", { length: 64 }).notNull(),
    provider: mysqlEnum("provider", ["stripe"]).default("stripe").notNull(),
    status: mysqlEnum("status", ["pending", "checkout_created", "paid", "failed", "expired", "refunded"])
      .default("pending")
      .notNull(),
    amountSatang: int("amountSatang").notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    credits: int("credits").notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull(),
    stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }),
    stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
    failureReason: varchar("failureReason", { length: 255 }),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => [
    uniqueIndex("payment_orders_idempotency_uq").on(table.idempotencyKey),
    uniqueIndex("payment_orders_stripe_session_uq").on(table.stripeCheckoutSessionId),
    index("payment_orders_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/** Durable webhook inbox/deduplication record. No full provider payload is retained. */
export const paymentEvents = mysqlTable(
  "payment_events",
  {
    stripeEventId: varchar("stripeEventId", { length: 255 }).primaryKey(),
    eventType: varchar("eventType", { length: 128 }).notNull(),
    objectId: varchar("objectId", { length: 255 }),
    livemode: boolean("livemode").notNull(),
    status: mysqlEnum("status", ["received", "processed", "ignored", "failed"]).default("received").notNull(),
    errorMessage: varchar("errorMessage", { length: 500 }),
    receivedAt: timestamp("receivedAt").defaultNow().notNull(),
    processedAt: timestamp("processedAt"),
  },
  table => [index("payment_events_object_type_idx").on(table.objectId, table.eventType)],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type WalletAccount = typeof walletAccounts.$inferSelect;
export type WalletLedgerEntry = typeof walletLedger.$inferSelect;
export type FortuneReadingRow = typeof fortuneReadings.$inferSelect;
export type PaymentOrder = typeof paymentOrders.$inferSelect;
