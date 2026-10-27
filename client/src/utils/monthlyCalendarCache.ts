export const MONTHLY_CALENDAR_CACHE_TTL_MS = 24 * 60 * 60 * 1_000;
export const MONTHLY_CALENDAR_FALLBACK_TTL_MS = 10 * 60 * 1_000;

export interface CalendarCacheStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

export interface CalendarCacheEntry<T> {
  savedAt: number;
  expiresAt: number;
  fallback: boolean;
  data: T;
}

export function makeMonthlyCalendarCacheKey(input: {
  year: number;
  month: number;
  zodiac: string;
  sassLevel: string;
}): string {
  return `dooduang:calendar:v2:${input.year}-${String(input.month).padStart(2, '0')}:${encodeURIComponent(input.zodiac)}:${input.sassLevel}`;
}

export function readMonthlyCalendarCache<T>(
  storage: CalendarCacheStorage,
  key: string,
  now = Date.now(),
): CalendarCacheEntry<T> | null {
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CalendarCacheEntry<T>;
    if (
      !entry ||
      typeof entry !== 'object' ||
      !Number.isFinite(entry.savedAt) ||
      !Number.isFinite(entry.expiresAt) ||
      typeof entry.fallback !== 'boolean' ||
      entry.expiresAt <= now ||
      entry.data == null
    ) {
      storage.removeItem?.(key);
      return null;
    }
    return entry;
  } catch {
    try { storage.removeItem?.(key); } catch {}
    return null;
  }
}

export function writeMonthlyCalendarCache<T>(
  storage: CalendarCacheStorage,
  key: string,
  data: T,
  ttlMs: number,
  now = Date.now(),
  fallback = false,
): void {
  try {
    const entry: CalendarCacheEntry<T> = { savedAt: now, expiresAt: now + ttlMs, fallback, data };
    storage.setItem(key, JSON.stringify(entry));
  } catch {
    // Private browsing, quota limits, or disabled storage must not block calendar use.
  }
}
