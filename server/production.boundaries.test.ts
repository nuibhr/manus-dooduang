import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { COIN_CATALOG, PAID_DISCIPLINES, READING_COSTS } from "../shared/catalog";

function anonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { host: "example.test" },
      get: () => "example.test",
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("production authorization boundaries", () => {
  it("blocks anonymous access to account state", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.account.bootstrap()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("blocks anonymous Checkout Session creation", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.payments.createCheckout({
      sku: "coin-starter",
      idempotencyKey: "checkout:test-boundary-0001",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("blocks anonymous Stripe return reconciliation", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    await expect(caller.payments.reconcile({
      id: "ae1c07c7-c57d-4fdc-97b9-2762ebed0025",
      sessionId: "cs_test_a1zP7gDwEJkfjz5yrtPmO0PozFmngYizBYsTPqSYedUYwBCUtO9uhKgb8J",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("exposes readiness without exposing credentials", async () => {
    const caller = appRouter.createCaller(anonymousContext());
    const readiness = await caller.payments.readiness();
    expect(Object.keys(readiness).sort()).toEqual(["configured", "liveModeEnabled", "mode"]);
    expect(["test", "live", "disabled"]).toContain(readiness.mode);
  });
});

describe("server-owned catalog invariants", () => {
  it("uses positive satang prices and positive credit grants", () => {
    for (const [sku, item] of Object.entries(COIN_CATALOG)) {
      expect(item.sku).toBe(sku);
      expect(item.currency).toBe("thb");
      expect(item.priceSatang).toBeGreaterThan(0);
      expect(Number.isInteger(item.priceSatang)).toBe(true);
      expect(item.coins).toBeGreaterThan(0);
      expect(Number.isInteger(item.coins)).toBe(true);
    }
  });

  it("keeps each discipline's reading prices positive and tiered", () => {
    for (const discipline of PAID_DISCIPLINES) {
      const costs = READING_COSTS[discipline];
      expect(costs.quick).toBeGreaterThan(0);
      expect(costs.standard).toBeGreaterThan(costs.quick);
      expect(costs.deep_soul).toBeGreaterThan(costs.standard);
    }
  });
});
