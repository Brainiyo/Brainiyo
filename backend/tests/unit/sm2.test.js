const { qualityScore, applySM2 } = require('../../src/utils/sm2');

describe('SM-2 Utility', () => {

  describe('qualityScore()', () => {
    test('correct + very fast (<20s) → 5', () => expect(qualityScore(true, 15)).toBe(5));
    test('correct + normal (≥20s) → 4',     () => expect(qualityScore(true, 40)).toBe(4));
    test('wrong + slow (>90s) → 1',         () => expect(qualityScore(false, 100)).toBe(1));
    test('wrong + moderate (60–90s) → 2',   () => expect(qualityScore(false, 70)).toBe(2));
    test('wrong + quick (30–60s) → 3',      () => expect(qualityScore(false, 45)).toBe(3));
    test('skip (≤30s) → 0',                 () => expect(qualityScore(false, 10)).toBe(0));
  });

  describe('applySM2()', () => {
    const base = { interval_days: 1, ease_factor: 2.50, repetitions: 0 };

    test('1st successful recall → interval=1, repetitions=1', () => {
      const r = applySM2(base, 5);
      expect(r.repetitions).toBe(1);
      expect(r.interval_days).toBe(1);
      expect(r.ease_factor).toBeGreaterThan(2.50);
    });

    test('2nd successful recall → interval=6, repetitions=2', () => {
      const r = applySM2({ ...base, repetitions: 1, interval_days: 1 }, 4);
      expect(r.repetitions).toBe(2);
      expect(r.interval_days).toBe(6);
    });

    test('3rd recall → interval = prev × EF', () => {
      const card = { interval_days: 6, ease_factor: 2.50, repetitions: 2 };
      const r    = applySM2(card, 4);
      expect(r.interval_days).toBe(Math.round(6 * 2.50));
      expect(r.repetitions).toBe(3);
    });

    test('failed recall → reset to interval=1, repetitions=0', () => {
      const r = applySM2({ interval_days: 25, ease_factor: 2.20, repetitions: 5 }, 1);
      expect(r.repetitions).toBe(0);
      expect(r.interval_days).toBe(1);
    });

    test('ease factor never falls below MIN_EASE_FACTOR (1.30)', () => {
      let card = { ...base };
      for (let i = 0; i < 20; i++) card = applySM2(card, 0);
      expect(card.ease_factor).toBeGreaterThanOrEqual(1.30);
    });

    test('next_review_at is in the future', () => {
      const r = applySM2(base, 5);
      expect(r.next_review_at.getTime()).toBeGreaterThan(Date.now());
    });

    test('quality=3 (slow correct) still advances repetitions', () => {
      const r = applySM2(base, 3);
      expect(r.repetitions).toBe(1);
    });

    test('quality=2 (failed) resets repetitions', () => {
      const r = applySM2({ ...base, repetitions: 3, interval_days: 10 }, 2);
      expect(r.repetitions).toBe(0);
    });
  });
});
