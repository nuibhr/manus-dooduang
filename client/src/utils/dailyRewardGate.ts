export type DailyRewardGate = 'sign-in' | 'already-claimed' | 'claim';

/** Resolve reward access before making any wallet mutation. */
export function resolveDailyRewardGate(isAuthenticated: boolean, isClaimedToday: boolean): DailyRewardGate {
  if (!isAuthenticated) return 'sign-in';
  if (isClaimedToday) return 'already-claimed';
  return 'claim';
}
