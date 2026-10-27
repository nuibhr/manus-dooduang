import type { TarotCard } from '../types';

export interface DailyTarotChoice {
  card: TarotCard;
  storedValue: string;
  reused: boolean;
}

/**
 * Resolve one Tarot card for a Bangkok-local date.
 * The same local device reuses its saved card for the same date; when no valid
 * saved value exists, randomIndex selects a card and the caller persists it.
 */
export function chooseDailyTarotCard(
  deck: TarotCard[],
  dateKey: string,
  savedValue: string | null,
  randomIndex: number,
): DailyTarotChoice {
  if (deck.length === 0) throw new Error('Tarot deck must contain at least one card');

  if (savedValue) {
    try {
      const saved = JSON.parse(savedValue) as { dateKey?: string; cardId?: number };
      if (saved.dateKey === dateKey) {
        const existing = deck.find(card => card.id === saved.cardId);
        if (existing) {
          return {
            card: existing,
            storedValue: JSON.stringify({ dateKey, cardId: existing.id }),
            reused: true,
          };
        }
      }
    } catch {
      // Invalid local storage is treated like a first visit and safely replaced.
    }
  }

  const safeIndex = Math.abs(Math.trunc(randomIndex)) % deck.length;
  const card = deck[safeIndex];
  return {
    card,
    storedValue: JSON.stringify({ dateKey, cardId: card.id }),
    reused: false,
  };
}
