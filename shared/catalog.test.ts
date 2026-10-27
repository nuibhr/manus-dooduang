import { describe, expect, it } from "vitest";
import { getReadingCost, READING_COSTS } from "./catalog";
import { getRewardAmount, getBangkokWeekWindow, WEEKLY_FREE_COIN_CAP } from "./rewards";

describe("reading price catalog", () => {
  it("provides transparent tiered prices by paid discipline", () => {
    expect(READING_COSTS.tarot).toEqual({ quick: 8, standard: 15, deep_soul: 35 });
    expect(READING_COSTS.oracle).toEqual({ quick: 10, standard: 18, deep_soul: 40 });
    expect(READING_COSTS.rune).toEqual({ quick: 8, standard: 15, deep_soul: 35 });
    expect(READING_COSTS.chinese).toEqual({ quick: 12, standard: 20, deep_soul: 45 });
    for (const tiers of Object.values(READING_COSTS)) {
      expect(tiers.quick).toBeGreaterThan(0);
      expect(tiers.standard).toBeGreaterThan(tiers.quick);
      expect(tiers.deep_soul).toBeGreaterThan(tiers.standard);
    }
  });

  it("returns the selected discipline's server-owned price", () => {
    expect(getReadingCost("tarot", "standard")).toBe(15);
    expect(getReadingCost("oracle", "deep_soul")).toBe(40);
  });
});

describe("weekly free-coin policy", () => {
  it("limits every combination of claims to the weekly cap", () => {
    expect(WEEKLY_FREE_COIN_CAP).toBe(25);
    expect(getRewardAmount("daily_checkin", 24)).toBe(1);
    expect(getRewardAmount("social_share", 22)).toBe(3);
    expect(getRewardAmount("daily_checkin", 25)).toBe(0);
    expect(getRewardAmount("social_share", 40)).toBe(0);
  });

  it("uses Monday-to-Sunday boundaries in Bangkok time, including week rollover", () => {
    const monday = getBangkokWeekWindow(new Date("2026-10-05T02:00:00.000Z"));
    expect(monday.weekKey).toBe("2026-10-05");
    expect(monday.startAt.toISOString()).toBe("2026-10-04T17:00:00.000Z");
    expect(monday.endAt.toISOString()).toBe("2026-10-11T17:00:00.000Z");
    const sunday = getBangkokWeekWindow(new Date("2026-10-11T16:59:59.000Z"));
    expect(sunday.weekKey).toBe("2026-10-05");
    const nextMonday = getBangkokWeekWindow(new Date("2026-10-11T17:00:00.000Z"));
    expect(nextMonday.weekKey).toBe("2026-10-12");
  });
});
