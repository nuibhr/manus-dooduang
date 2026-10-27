import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  FortuneReadingRow,
  InsertUser,
  fortuneReadings,
  lineAccounts,
  paymentEvents,
  paymentOrders,
  rewardClaims,
  userProfiles,
  users,
  walletAccounts,
  walletLedger,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { getBangkokWeekWindow, getRewardAmount, WEEKLY_FREE_COIN_CAP } from "../shared/rewards";

let _db: ReturnType<typeof drizzle> | null = null;

export class DatabaseUnavailableError extends Error {}
export class InsufficientCreditsError extends Error {}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new DatabaseUnavailableError("Database is not configured");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await requireDb();

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await requireDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

/** Read only the account-link row; do not persist unverified LINE profile data. */
export async function getLineAccount(userId: number) {
  const database = await requireDb();
  const result = await database.select().from(lineAccounts).where(eq(lineAccounts.userId, userId)).limit(1);
  return result[0] ?? null;
}

/** Link a server-verified LINE subject to the current Manus account exactly once. */
export async function linkLineAccount(userId: number, lineUserId: string) {
  const database = await requireDb();
  try {
    return await database.transaction(async transaction => {
      const existingUserLink = await transaction.select().from(lineAccounts).where(eq(lineAccounts.userId, userId)).limit(1);
      if (existingUserLink[0]) {
        if (existingUserLink[0].lineUserId !== lineUserId) throw new Error("LINE_ACCOUNT_ALREADY_LINKED");
        return { linked: true, alreadyLinked: true } as const;
      }

      const existingLineLink = await transaction.select().from(lineAccounts).where(eq(lineAccounts.lineUserId, lineUserId)).limit(1);
      if (existingLineLink[0]) throw new Error("LINE_ID_ALREADY_LINKED");

      await transaction.insert(lineAccounts).values({ userId, lineUserId });
      return { linked: true, alreadyLinked: false } as const;
    });
  } catch (error: any) {
    if (error?.message === "LINE_ACCOUNT_ALREADY_LINKED" || error?.message === "LINE_ID_ALREADY_LINKED") throw error;
    if (error?.code === "ER_DUP_ENTRY") throw new Error("LINE_ID_ALREADY_LINKED");
    throw error;
  }
}

/** Creates the authoritative wallet exactly once, including its welcome-credit ledger entry. */
export async function ensureWallet(userId: number): Promise<void> {
  const db = await requireDb();
  try {
    await db.transaction(async tx => {
      const existing = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, userId)).limit(1);
      if (existing[0]) return;

      await tx.insert(walletAccounts).values({ userId, balance: 15, version: 0 });
      await tx.insert(walletLedger).values({
        userId,
        direction: "credit",
        amount: 15,
        balanceAfter: 15,
        reason: "ของขวัญต้อนรับสมาชิกใหม่",
        referenceType: "welcome_bonus",
        referenceId: String(userId),
        idempotencyKey: `welcome:${userId}`,
        metadata: null,
      });
    });
  } catch (error: any) {
    // A concurrent first request can win the unique userId race. Re-read below.
    if (error?.code !== "ER_DUP_ENTRY") throw error;
  }
}

export async function getWalletSnapshot(userId: number) {
  const db = await requireDb();
  await ensureWallet(userId);
  const wallet = await db.select().from(walletAccounts).where(eq(walletAccounts.userId, userId)).limit(1);
  if (!wallet[0]) throw new DatabaseUnavailableError("Wallet initialization failed");

  const ledger = await db
    .select()
    .from(walletLedger)
    .where(eq(walletLedger.userId, userId))
    .orderBy(desc(walletLedger.createdAt), desc(walletLedger.id))
    .limit(50);

  return { wallet: wallet[0], ledger };
}

function bangkokDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function previousDateKey(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);
  date.setUTCDate(date.getUTCDate() - 1);
  return bangkokDateKey(date);
}

export async function getRewardStatus(userId: number) {
  const db = await requireDb();
  const today = bangkokDateKey();
  const week = getBangkokWeekWindow();
  const [recent, weekly] = await Promise.all([
    db
      .select()
      .from(rewardClaims)
      .where(eq(rewardClaims.userId, userId))
      .orderBy(desc(rewardClaims.createdAt), desc(rewardClaims.id))
      .limit(30),
    db
      .select()
      .from(rewardClaims)
      .where(and(
        eq(rewardClaims.userId, userId),
        gte(rewardClaims.createdAt, week.startAt),
        lt(rewardClaims.createdAt, week.endAt),
      )),
  ]);
  const latestDaily = recent.find(item => item.claimType === "daily_checkin");
  const weeklyEarned = weekly.reduce((sum, item) => sum + item.amount, 0);
  return {
    today,
    weekKey: week.weekKey,
    dailyClaimed: recent.some(item => item.claimType === "daily_checkin" && item.periodKey === today),
    shareClaimed: weekly.some(item => item.claimType === "social_share"),
    streakDay: latestDaily?.streakDay ?? 0,
    weeklyEarned,
    weeklyCap: WEEKLY_FREE_COIN_CAP,
    weeklyRemaining: Math.max(0, WEEKLY_FREE_COIN_CAP - weeklyEarned),
  };
}

export async function claimReward(userId: number, claimType: "daily_checkin" | "social_share") {
  await ensureWallet(userId);
  const db = await requireDb();
  const periodKey = bangkokDateKey();
  const week = getBangkokWeekWindow();

  try {
    return await db.transaction(async tx => {
      await tx.execute(sql`SELECT userId FROM wallet_accounts WHERE userId = ${userId} FOR UPDATE`);
      const wallets = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, userId)).limit(1);
      if (!wallets[0]) throw new Error("WALLET_NOT_FOUND");

      const weeklyClaims = await tx
        .select()
        .from(rewardClaims)
        .where(and(
          eq(rewardClaims.userId, userId),
          gte(rewardClaims.createdAt, week.startAt),
          lt(rewardClaims.createdAt, week.endAt),
        ));
      const weeklyEarned = weeklyClaims.reduce((sum, claim) => sum + claim.amount, 0);

      const duplicate = await tx
        .select()
        .from(rewardClaims)
        .where(and(
          eq(rewardClaims.userId, userId),
          eq(rewardClaims.claimType, claimType),
          eq(rewardClaims.periodKey, periodKey),
        ))
        .limit(1);
      if (duplicate[0]) {
        return {
          claimed: false,
          amount: 0,
          balance: wallets[0].balance,
          streakDay: duplicate[0].streakDay ?? 0,
          periodKey,
          weeklyEarned,
          weeklyCap: WEEKLY_FREE_COIN_CAP,
          weeklyRemaining: Math.max(0, WEEKLY_FREE_COIN_CAP - weeklyEarned),
        };
      }

      if (claimType === "social_share" && weeklyClaims.some(claim => claim.claimType === "social_share")) {
        return { claimed: false, amount: 0, balance: wallets[0].balance, streakDay: 0, periodKey, weeklyEarned, weeklyCap: WEEKLY_FREE_COIN_CAP, weeklyRemaining: Math.max(0, WEEKLY_FREE_COIN_CAP - weeklyEarned) };
      }
      const amount = getRewardAmount(claimType, weeklyEarned);
      if (amount <= 0) {
        return { claimed: false, amount: 0, balance: wallets[0].balance, streakDay: 0, periodKey, weeklyEarned, weeklyCap: WEEKLY_FREE_COIN_CAP, weeklyRemaining: 0, capReached: true };
      }

      let streakDay: number | null = null;
      if (claimType === "daily_checkin") {
        const latest = await tx
          .select()
          .from(rewardClaims)
          .where(and(eq(rewardClaims.userId, userId), eq(rewardClaims.claimType, "daily_checkin")))
          .orderBy(desc(rewardClaims.createdAt), desc(rewardClaims.id))
          .limit(1);
        const previousStreak = latest[0]?.periodKey === previousDateKey(periodKey) ? latest[0]?.streakDay ?? 0 : 0;
        streakDay = (previousStreak % 7) + 1;
      }

      await tx.insert(rewardClaims).values({ userId, claimType, periodKey, amount, streakDay });
      const balanceAfter = wallets[0].balance + amount;
      await tx
        .update(walletAccounts)
        .set({ balance: balanceAfter, version: sql`${walletAccounts.version} + 1` })
        .where(eq(walletAccounts.userId, userId));
      await tx.insert(walletLedger).values({
        userId,
        direction: "credit",
        amount,
        balanceAfter,
        reason: claimType === "daily_checkin" ? `เช็คอินวันที่ ${streakDay}` : "โบนัสแชร์ประจำวัน",
        referenceType: "reward_claim",
        referenceId: `${claimType}:${periodKey}`,
        idempotencyKey: `reward:${userId}:${claimType}:${periodKey}`,
        metadata: { streakDay },
      });
      const newWeeklyEarned = weeklyEarned + amount;
      return {
        claimed: true,
        amount,
        balance: balanceAfter,
        streakDay: streakDay ?? 0,
        periodKey,
        weeklyEarned: newWeeklyEarned,
        weeklyCap: WEEKLY_FREE_COIN_CAP,
        weeklyRemaining: Math.max(0, WEEKLY_FREE_COIN_CAP - newWeeklyEarned),
      };
    });
  } catch (error: any) {
    if (error?.code !== "ER_DUP_ENTRY") throw error;
    const snapshot = await getWalletSnapshot(userId);
    const status = await getRewardStatus(userId);
    return {
      claimed: false,
      amount: 0,
      balance: snapshot.wallet.balance,
      streakDay: status.streakDay,
      periodKey,
      weeklyEarned: status.weeklyEarned,
      weeklyCap: status.weeklyCap,
      weeklyRemaining: status.weeklyRemaining,
    };
  }
}

export async function getProfile(userId: number) {
  const db = await requireDb();
  const rows = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertProfile(input: {
  userId: number;
  birthDate: string;
  birthTime: string;
  birthTimeUnknown: boolean;
  consentVersion: string;
}) {
  const db = await requireDb();
  const consentedAt = new Date();
  await db.insert(userProfiles).values({ ...input, consentedAt }).onDuplicateKeyUpdate({
    set: {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      birthTimeUnknown: input.birthTimeUnknown,
      consentVersion: input.consentVersion,
      consentedAt,
    },
  });
  return getProfile(input.userId);
}

export async function listReadings(userId: number, limit = 50) {
  const db = await requireDb();
  return db
    .select()
    .from(fortuneReadings)
    .where(and(eq(fortuneReadings.userId, userId), eq(fortuneReadings.status, "completed")))
    .orderBy(desc(fortuneReadings.createdAt))
    .limit(Math.min(100, Math.max(1, limit)));
}

export async function deleteReading(userId: number, readingId: string) {
  const db = await requireDb();
  await db.delete(fortuneReadings).where(and(eq(fortuneReadings.id, readingId), eq(fortuneReadings.userId, userId)));
}

export async function clearReadings(userId: number) {
  const db = await requireDb();
  await db.delete(fortuneReadings).where(eq(fortuneReadings.userId, userId));
}

export async function reserveReading(input: {
  id: string;
  userId: number;
  discipline: string;
  topic: string;
  question: string;
  selectedItems: unknown;
  sassyLevel: string;
  depthTier: "quick" | "standard" | "deep_soul";
  cost: number;
}): Promise<{ reading: FortuneReadingRow; balance: number; duplicate: boolean }> {
  const db = await requireDb();

  return db.transaction(async tx => {
    const duplicate = await tx.select().from(fortuneReadings).where(eq(fortuneReadings.id, input.id)).limit(1);
    if (duplicate[0]) {
      if (duplicate[0].userId !== input.userId) throw new Error("READING_ID_CONFLICT");
      const wallet = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, input.userId)).limit(1);
      return { reading: duplicate[0], balance: wallet[0]?.balance ?? 0, duplicate: true };
    }

    await tx.execute(sql`SELECT userId FROM wallet_accounts WHERE userId = ${input.userId} FOR UPDATE`);
    const wallets = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, input.userId)).limit(1);
    if (!wallets[0]) throw new DatabaseUnavailableError("Wallet has not been initialized");
    if (wallets[0].balance < input.cost) throw new InsufficientCreditsError("INSUFFICIENT_CREDITS");

    const balanceAfter = wallets[0].balance - input.cost;
    await tx.insert(fortuneReadings).values({
      id: input.id,
      userId: input.userId,
      status: "processing",
      discipline: input.discipline,
      topic: input.topic,
      question: input.question,
      selectedItems: input.selectedItems,
      sassyLevel: input.sassyLevel,
      depthTier: input.depthTier,
      coinsSpent: input.cost,
    });
    await tx
      .update(walletAccounts)
      .set({ balance: balanceAfter, version: sql`${walletAccounts.version} + 1` })
      .where(eq(walletAccounts.userId, input.userId));
    await tx.insert(walletLedger).values({
      userId: input.userId,
      direction: "debit",
      amount: input.cost,
      balanceAfter,
      reason: `ผ่าดวง ${input.discipline}: ${input.topic}`,
      referenceType: "reading",
      referenceId: input.id,
      idempotencyKey: `reading:${input.id}:debit`,
      metadata: { depthTier: input.depthTier },
    });

    const rows = await tx.select().from(fortuneReadings).where(eq(fortuneReadings.id, input.id)).limit(1);
    return { reading: rows[0], balance: balanceAfter, duplicate: false };
  });
}

export async function completeReading(input: {
  id: string;
  userId: number;
  markdownContent: string;
  providerModel: string;
  fallback: boolean;
}) {
  const db = await requireDb();
  await db
    .update(fortuneReadings)
    .set({
      status: "completed",
      markdownContent: input.markdownContent,
      providerModel: input.providerModel,
      fallback: input.fallback,
      errorCode: null,
      completedAt: new Date(),
    })
    .where(and(eq(fortuneReadings.id, input.id), eq(fortuneReadings.userId, input.userId)));
  const rows = await db.select().from(fortuneReadings).where(eq(fortuneReadings.id, input.id)).limit(1);
  return rows[0];
}

export async function failAndRefundReading(input: { id: string; userId: number; errorCode: string }) {
  const db = await requireDb();
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT userId FROM wallet_accounts WHERE userId = ${input.userId} FOR UPDATE`);
    const readings = await tx
      .select()
      .from(fortuneReadings)
      .where(and(eq(fortuneReadings.id, input.id), eq(fortuneReadings.userId, input.userId)))
      .limit(1);
    const reading = readings[0];
    if (!reading) throw new Error("READING_NOT_FOUND");

    const refundKey = `reading:${input.id}:refund`;
    const priorRefund = await tx.select().from(walletLedger).where(eq(walletLedger.idempotencyKey, refundKey)).limit(1);
    if (!priorRefund[0]) {
      const wallets = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, input.userId)).limit(1);
      const balanceAfter = (wallets[0]?.balance ?? 0) + reading.coinsSpent;
      await tx
        .update(walletAccounts)
        .set({ balance: balanceAfter, version: sql`${walletAccounts.version} + 1` })
        .where(eq(walletAccounts.userId, input.userId));
      await tx.insert(walletLedger).values({
        userId: input.userId,
        direction: "credit",
        amount: reading.coinsSpent,
        balanceAfter,
        reason: "คืนเหรียญอัตโนมัติ: ระบบอ่านดวงไม่สำเร็จ",
        referenceType: "reading_refund",
        referenceId: input.id,
        idempotencyKey: refundKey,
        metadata: { errorCode: input.errorCode },
      });
    }

    await tx
      .update(fortuneReadings)
      .set({ status: "failed", errorCode: input.errorCode, completedAt: new Date() })
      .where(eq(fortuneReadings.id, input.id));
  });
}

export async function createPaymentOrder(input: {
  id: string;
  userId: number;
  sku: string;
  amountSatang: number;
  currency: string;
  credits: number;
  idempotencyKey: string;
}) {
  const db = await requireDb();
  await db.insert(paymentOrders).values({ ...input, status: "pending" });
  return getPaymentOrder(input.userId, input.id);
}

export async function getPaymentOrder(userId: number, id: string) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(paymentOrders)
    .where(and(eq(paymentOrders.id, id), eq(paymentOrders.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPaymentOrderByIdempotency(userId: number, idempotencyKey: string) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(paymentOrders)
    .where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.idempotencyKey, idempotencyKey)))
    .limit(1);
  return rows[0] ?? null;
}

export async function attachStripeSession(orderId: string, sessionId: string) {
  const db = await requireDb();
  await db
    .update(paymentOrders)
    .set({ status: "checkout_created", stripeCheckoutSessionId: sessionId })
    .where(eq(paymentOrders.id, orderId));
}

export async function recordPaymentEvent(input: {
  stripeEventId: string;
  eventType: string;
  objectId: string | null;
  livemode: boolean;
}) {
  const db = await requireDb();
  const existing = await db.select().from(paymentEvents).where(eq(paymentEvents.stripeEventId, input.stripeEventId)).limit(1);
  if (existing[0]) {
    if (existing[0].status === "processed" || existing[0].status === "ignored") return false;
    await db
      .update(paymentEvents)
      .set({ status: "received", errorMessage: null, processedAt: null })
      .where(eq(paymentEvents.stripeEventId, input.stripeEventId));
    return true;
  }
  try {
    await db.insert(paymentEvents).values(input);
    return true;
  } catch (error: any) {
    if (error?.code === "ER_DUP_ENTRY") return true;
    throw error;
  }
}

export async function hasPaidOrder(userId: number) {
  const db = await requireDb();
  const rows = await db
    .select({ id: paymentOrders.id })
    .from(paymentOrders)
    .where(and(eq(paymentOrders.userId, userId), eq(paymentOrders.status, "paid")))
    .limit(1);
  return Boolean(rows[0]);
}

export async function markPaymentEvent(stripeEventId: string, status: "processed" | "ignored" | "failed", errorMessage?: string) {
  const db = await requireDb();
  await db
    .update(paymentEvents)
    .set({ status, errorMessage: errorMessage?.slice(0, 500) ?? null, processedAt: new Date() })
    .where(eq(paymentEvents.stripeEventId, stripeEventId));
}

export async function markPaymentOrderTerminalBySession(
  stripeSessionId: string,
  status: "failed" | "expired",
  failureReason: string,
) {
  const db = await requireDb();
  return db.transaction(async tx => {
    await tx.execute(sql`SELECT id FROM payment_orders WHERE stripeCheckoutSessionId = ${stripeSessionId} FOR UPDATE`);
    const rows = await tx
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.stripeCheckoutSessionId, stripeSessionId))
      .limit(1);
    const order = rows[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");
    if (order.status === "paid" || order.status === "refunded") return order;
    await tx
      .update(paymentOrders)
      .set({ status, failureReason: failureReason.slice(0, 255) })
      .where(eq(paymentOrders.id, order.id));
    const updated = await tx.select().from(paymentOrders).where(eq(paymentOrders.id, order.id)).limit(1);
    return updated[0];
  });
}

export async function fulfillStripeOrder(input: {
  stripeSessionId: string;
  paymentIntentId: string | null;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
  livemode: boolean;
}) {
  const db = await requireDb();
  return db.transaction(async tx => {
    const orders = await tx
      .select()
      .from(paymentOrders)
      .where(eq(paymentOrders.stripeCheckoutSessionId, input.stripeSessionId))
      .limit(1);
    const order = orders[0];
    if (!order) throw new Error("ORDER_NOT_FOUND");

    await tx.execute(sql`SELECT userId FROM wallet_accounts WHERE userId = ${order.userId} FOR UPDATE`);
    const refreshed = await tx.select().from(paymentOrders).where(eq(paymentOrders.id, order.id)).limit(1);
    if (refreshed[0]?.status === "paid") return refreshed[0];
    if (input.paymentStatus !== "paid") throw new Error("PAYMENT_NOT_PAID");
    if (input.livemode && !ENV.stripeLiveModeEnabled) throw new Error("LIVE_MODE_DISABLED");
    if (order.amountSatang !== input.amountTotal || order.currency !== input.currency.toLowerCase()) {
      throw new Error("PAYMENT_AMOUNT_MISMATCH");
    }

    const wallets = await tx.select().from(walletAccounts).where(eq(walletAccounts.userId, order.userId)).limit(1);
    if (!wallets[0]) throw new Error("WALLET_NOT_FOUND");
    const balanceAfter = wallets[0].balance + order.credits;

    await tx
      .update(walletAccounts)
      .set({ balance: balanceAfter, version: sql`${walletAccounts.version} + 1` })
      .where(eq(walletAccounts.userId, order.userId));
    await tx.insert(walletLedger).values({
      userId: order.userId,
      direction: "credit",
      amount: order.credits,
      balanceAfter,
      reason: `เติมเหรียญผ่าน Stripe (${order.sku})`,
      referenceType: "stripe_checkout",
      referenceId: input.stripeSessionId,
      idempotencyKey: `stripe:${input.stripeSessionId}:fulfillment`,
      metadata: { orderId: order.id, paymentIntentId: input.paymentIntentId },
    });
    await tx
      .update(paymentOrders)
      .set({ status: "paid", stripePaymentIntentId: input.paymentIntentId, paidAt: new Date() })
      .where(eq(paymentOrders.id, order.id));

    const completed = await tx.select().from(paymentOrders).where(eq(paymentOrders.id, order.id)).limit(1);
    return completed[0];
  });
}
