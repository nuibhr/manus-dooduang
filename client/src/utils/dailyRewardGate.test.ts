import { describe, expect, it } from 'vitest';
import { resolveDailyRewardGate } from './dailyRewardGate';

describe('resolveDailyRewardGate', () => {
  it('requires sign-in before checking/claiming a wallet reward', () => {
    expect(resolveDailyRewardGate(false, false)).toBe('sign-in');
    expect(resolveDailyRewardGate(false, true)).toBe('sign-in');
  });

  it('blocks duplicate claims for an authenticated user', () => {
    expect(resolveDailyRewardGate(true, true)).toBe('already-claimed');
  });

  it('allows one claim for an authenticated user who has not claimed today', () => {
    expect(resolveDailyRewardGate(true, false)).toBe('claim');
  });
});
