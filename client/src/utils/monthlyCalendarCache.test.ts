import { describe, expect, it } from 'vitest';
import {
  makeMonthlyCalendarCacheKey,
  readMonthlyCalendarCache,
  writeMonthlyCalendarCache,
} from './monthlyCalendarCache';

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() { return values.size; },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => { values.delete(key); },
    setItem: (key, value) => { values.set(key, value); },
  } as Storage;
}

describe('monthly calendar cache', () => {
  it('builds a key that varies with month, zodiac, and reading tone', () => {
    const base = { year: 2026, month: 10, zodiac: 'general', sassLevel: 'spicy' };
    expect(makeMonthlyCalendarCacheKey(base)).toBe('dooduang:calendar:v2:2026-10:general:spicy');
    expect(makeMonthlyCalendarCacheKey({ ...base, zodiac: 'libra' })).not.toBe(makeMonthlyCalendarCacheKey(base));
    expect(makeMonthlyCalendarCacheKey({ ...base, sassLevel: 'mild' })).not.toBe(makeMonthlyCalendarCacheKey(base));
  });

  it('writes and reads a fresh entry, then expires it by TTL', () => {
    const storage = memoryStorage();
    const key = 'calendar:test';
    writeMonthlyCalendarCache(storage, key, { days: [1, 2] }, 1_000, 5_000, true);
    expect(readMonthlyCalendarCache(storage, key, 5_999)?.data).toEqual({ days: [1, 2] });
    expect(readMonthlyCalendarCache(storage, key, 5_999)?.fallback).toBe(true);
    expect(readMonthlyCalendarCache(storage, key, 6_000)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });

  it('treats malformed JSON and disabled storage as cache misses', () => {
    const storage = memoryStorage();
    storage.setItem('bad', '{not json');
    expect(readMonthlyCalendarCache(storage, 'bad')).toBeNull();
    const failingStorage = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('quota'); },
    };
    expect(readMonthlyCalendarCache(failingStorage, 'blocked')).toBeNull();
    expect(() => writeMonthlyCalendarCache(failingStorage, 'blocked', {}, 100)).not.toThrow();
  });
});
