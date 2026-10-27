import { describe, expect, it } from 'vitest';
import type { TarotCard } from '../types';
import { chooseDailyTarotCard } from './dailyTarot';

const deck = [
  { id: 10, name: 'The Sun' },
  { id: 20, name: 'The Moon' },
  { id: 30, name: 'The Star' },
] as TarotCard[];

describe('chooseDailyTarotCard', () => {
  it('selects a card and returns a persistable date-keyed value for a first visit', () => {
    const result = chooseDailyTarotCard(deck, '2026-10-05', null, 4);
    expect(result.card.id).toBe(20);
    expect(result.reused).toBe(false);
    expect(JSON.parse(result.storedValue)).toEqual({ dateKey: '2026-10-05', cardId: 20 });
  });

  it('reuses the same valid card for the same Bangkok date regardless of new randomness', () => {
    const saved = JSON.stringify({ dateKey: '2026-10-05', cardId: 30 });
    const result = chooseDailyTarotCard(deck, '2026-10-05', saved, 0);
    expect(result.card.id).toBe(30);
    expect(result.reused).toBe(true);
  });

  it('draws again when the date changes or the saved card no longer exists', () => {
    const oldDate = JSON.stringify({ dateKey: '2026-10-04', cardId: 30 });
    const deletedCard = JSON.stringify({ dateKey: '2026-10-05', cardId: 99 });
    expect(chooseDailyTarotCard(deck, '2026-10-05', oldDate, 0).card.id).toBe(10);
    expect(chooseDailyTarotCard(deck, '2026-10-05', deletedCard, 2).card.id).toBe(30);
  });

  it('recovers from malformed storage and rejects an empty deck', () => {
    expect(chooseDailyTarotCard(deck, '2026-10-05', '{broken', 1).card.id).toBe(20);
    expect(() => chooseDailyTarotCard([], '2026-10-05', null, 0)).toThrow(/at least one card/);
  });
});
