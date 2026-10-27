export const COIN_CATALOG = {
  "coin-double-first": {
    sku: "coin-double-first",
    name: "โปรเปิดใจคูณสอง",
    coins: 100,
    priceSatang: 2_900,
    currency: "thb",
    firstPurchaseOnly: true,
  },
  "coin-starter": {
    sku: "coin-starter",
    name: "Starter พกไว้ถามด่วน",
    coins: 80,
    priceSatang: 4_900,
    currency: "thb",
    firstPurchaseOnly: false,
  },
  "coin-popular": {
    sku: "coin-popular",
    name: "แพ็กยอดนิยม",
    coins: 250,
    priceSatang: 11_900,
    currency: "thb",
    firstPurchaseOnly: false,
  },
  "coin-vip": {
    sku: "coin-vip",
    name: "VIP Bestie",
    coins: 800,
    priceSatang: 29_900,
    currency: "thb",
    firstPurchaseOnly: false,
  },
  "coin-grand": {
    sku: "coin-grand",
    name: "อภิมหาเศรษฐี",
    coins: 2_500,
    priceSatang: 69_900,
    currency: "thb",
    firstPurchaseOnly: false,
  },
} as const;

export type CoinSku = keyof typeof COIN_CATALOG;

export const PAID_DISCIPLINES = ["tarot", "oracle", "rune", "chinese"] as const;
export type PaidDiscipline = (typeof PAID_DISCIPLINES)[number];
export type ReadingDepth = "quick" | "standard" | "deep_soul";

/** ราคาหน่วยเหรียญ: แยกศาสตร์และความลึก; server เป็นผู้คำนวณ/หักเงินจริงเสมอ */
export const READING_COSTS: Record<PaidDiscipline, Record<ReadingDepth, number>> = {
  tarot: { quick: 8, standard: 15, deep_soul: 35 },
  oracle: { quick: 10, standard: 18, deep_soul: 40 },
  rune: { quick: 8, standard: 15, deep_soul: 35 },
  chinese: { quick: 12, standard: 20, deep_soul: 45 },
};

export function isPaidDiscipline(value: string): value is PaidDiscipline {
  return (PAID_DISCIPLINES as readonly string[]).includes(value);
}

export function getReadingCost(discipline: PaidDiscipline, depth: ReadingDepth): number {
  return READING_COSTS[discipline][depth];
}
