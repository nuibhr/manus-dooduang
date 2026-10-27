import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";
import { appRouter } from "./routers";
import {
  fortuneReadings,
  paymentOrders,
  rewardClaims,
  userProfiles,
  users,
  walletAccounts,
  walletLedger,
} from "../drizzle/schema";

const enabled = process.env.RUN_DB_INTEGRATION_TESTS === "true" && Boolean(process.env.DATABASE_URL);
const openId = `integration-${randomUUID()}`;
let userId: number | null = null;

function contextForUser(user: NonNullable<TrpcContext["user"]>): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: { host: "doopuangth-7zcjyrkh.manus.space" },
      get: () => "doopuangth-7zcjyrkh.manus.space",
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe.runIf(enabled)("TiDB account persistence", () => {
  afterAll(async () => {
    if (!userId) return;
    const sqlDb = await db.getDb();
    if (!sqlDb) return;
    await sqlDb.delete(walletLedger).where(eq(walletLedger.userId, userId));
    await sqlDb.delete(rewardClaims).where(eq(rewardClaims.userId, userId));
    await sqlDb.delete(fortuneReadings).where(eq(fortuneReadings.userId, userId));
    await sqlDb.delete(paymentOrders).where(eq(paymentOrders.userId, userId));
    await sqlDb.delete(userProfiles).where(eq(userProfiles.userId, userId));
    await sqlDb.delete(walletAccounts).where(eq(walletAccounts.userId, userId));
    await sqlDb.delete(users).where(eq(users.id, userId));
  });

  it("persists profile, idempotent rewards, wallet ledger and readings", async () => {
    await db.upsertUser({
      openId,
      name: "Integration Test User",
      email: `${openId}@example.invalid`,
      loginMethod: "test",
      lastSignedIn: new Date(),
    });
    const user = await db.getUserByOpenId(openId);
    expect(user).toBeTruthy();
    userId = user!.id;

    const caller = appRouter.createCaller(contextForUser(user!));
    const initial = await caller.account.bootstrap();
    expect(initial.wallet.balance).toBe(15);
    expect(initial.ledger.some(entry => entry.referenceType === "welcome_bonus")).toBe(true);

    const profile = await caller.account.saveProfile({
      birthDate: "1990-01-02",
      birthTime: "08:30",
      birthTimeUnknown: false,
      consentVersion: "privacy-v1",
    });
    expect(profile?.birthDate).toBe("1990-01-02");

    const firstClaim = await caller.wallet.claimReward({ claimType: "daily_checkin" });
    const duplicateClaim = await caller.wallet.claimReward({ claimType: "daily_checkin" });
    expect(firstClaim.claimed).toBe(true);
    expect(firstClaim.amount).toBeGreaterThan(0);
    expect(duplicateClaim).toMatchObject({ claimed: false, amount: 0, balance: firstClaim.balance });

    const readingId = randomUUID();
    const reserved = await db.reserveReading({
      id: readingId,
      userId: user!.id,
      discipline: "tarot",
      topic: "work",
      question: "Integration persistence check",
      selectedItems: [{ id: "test-card" }],
      sassyLevel: "mild",
      depthTier: "quick",
      cost: 8,
    });
    const duplicateReservation = await db.reserveReading({
      id: readingId,
      userId: user!.id,
      discipline: "tarot",
      topic: "work",
      question: "Integration persistence check",
      selectedItems: [{ id: "test-card" }],
      sassyLevel: "mild",
      depthTier: "quick",
      cost: 8,
    });
    expect(reserved.duplicate).toBe(false);
    expect(duplicateReservation).toMatchObject({ duplicate: true, balance: reserved.balance });

    await db.completeReading({
      id: readingId,
      userId: user!.id,
      markdownContent: "# Verified persisted reading",
      providerModel: "integration-test",
      fallback: false,
    });

    const persisted = await caller.account.bootstrap();
    expect(persisted.wallet.balance).toBe(firstClaim.balance - 8);
    expect(persisted.readings).toHaveLength(1);
    expect(persisted.readings[0]).toMatchObject({ id: readingId, status: "completed" });

    const orderId = randomUUID();
    const sessionId = `cs_test_integration${orderId.replaceAll("-", "")}`;
    await db.createPaymentOrder({
      id: orderId,
      userId: user!.id,
      sku: "coin-starter",
      amountSatang: 4900,
      currency: "thb",
      credits: 80,
      idempotencyKey: `integration:${orderId}`,
    });
    await db.attachStripeSession(orderId, sessionId);
    const expired = await db.markPaymentOrderTerminalBySession(sessionId, "expired", "checkout.session.expired");
    expect(expired).toMatchObject({ id: orderId, status: "expired", failureReason: "checkout.session.expired" });

    await caller.readings.clear();
    expect(await db.listReadings(user!.id)).toHaveLength(0);
  }, 30_000);
});
