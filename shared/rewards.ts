export const WEEKLY_FREE_COIN_CAP = 25;
export const DAILY_CHECKIN_COINS = 3;
export const WEEKLY_SHARE_BONUS_COINS = 4;

export interface BangkokWeekWindow {
  weekKey: string;
  startDateKey: string;
  endDateKey: string;
  startAt: Date;
  endAt: Date;
}

/** สร้างขอบเขตสัปดาห์จันทร์–อาทิตย์ตาม Asia/Bangkok โดยไม่พึ่ง timezone ของเครื่อง */
export function getBangkokWeekWindow(now: Date = new Date()): BangkokWeekWindow {
  const todayKey = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const utcDay = new Date(`${todayKey}T00:00:00.000Z`);
  const daysSinceMonday = (utcDay.getUTCDay() + 6) % 7;
  const startUtc = new Date(utcDay);
  startUtc.setUTCDate(startUtc.getUTCDate() - daysSinceMonday);
  const endUtc = new Date(startUtc);
  endUtc.setUTCDate(endUtc.getUTCDate() + 7);
  const dateKey = (date: Date) => date.toISOString().slice(0, 10);
  const startDateKey = dateKey(startUtc);
  const endDateKey = dateKey(new Date(endUtc.getTime() - 86_400_000));
  const localStart = new Date(`${startDateKey}T00:00:00+07:00`);
  const localEnd = new Date(`${dateKey(endUtc)}T00:00:00+07:00`);

  return {
    weekKey: startDateKey,
    startDateKey,
    endDateKey,
    startAt: localStart,
    endAt: localEnd,
  };
}

export function getRewardAmount(
  claimType: "daily_checkin" | "social_share",
  weeklyEarned: number,
): number {
  const remaining = Math.max(0, WEEKLY_FREE_COIN_CAP - weeklyEarned);
  const requested = claimType === "daily_checkin" ? DAILY_CHECKIN_COINS : WEEKLY_SHARE_BONUS_COINS;
  return Math.min(requested, remaining);
}
