const { calculateNextReview, calculateTopicMastery } = require('../../src/modules/adaptive-engine/adaptive.service');

describe('Adaptive Engine - SM2', () => {
  test('calculateNextReview - Perfect quality (5) on first attempt', () => {
    const result = calculateNextReview(5, 0, 1, 2.5);
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(1);
    expect(result.newEaseFactor).toBe(2.6); // 2.5 + (0.1 - (0)*...)
  });

  test('calculateNextReview - Perfect quality (5) on third attempt', () => {
    const result = calculateNextReview(5, 2, 6, 2.5);
    expect(result.newInterval).toBe(15); // Math.round(6 * 2.5)
    expect(result.newRepetitions).toBe(3);
  });

  test('calculateNextReview - Failure quality (0) resets repetitions', () => {
    const result = calculateNextReview(0, 5, 20, 2.5);
    expect(result.newInterval).toBe(1);
    expect(result.newRepetitions).toBe(0);
    expect(result.newEaseFactor).toBe(1.7); // Significantly decreased
  });

  test('calculateNextReview - Ease factor minimum is 1.3', () => {
    const result = calculateNextReview(0, 0, 1, 1.3);
    expect(result.newEaseFactor).toBe(1.3);
  });
});

describe('Adaptive Engine - Topic Mastery', () => {
  const mockDb = (rows) => ({
    query: jest.fn().mockResolvedValue({ rows })
  });

  test('calculateTopicMastery - Weighted speed reward', async () => {
    const db = mockDb([
      { is_correct: true, time_taken_seconds: 15, attempted_at: new Date() }, // Speed reward: 1.2
    ]);
    const result = await calculateTopicMastery('u1', 't1', db);
    expect(result.masteryLevel).toBe(100); // 1.2 / 1.0 capped at 100%
  });

  test('calculateTopicMastery - Weighted speed penalty', async () => {
    const db = mockDb([
      { is_correct: true, time_taken_seconds: 100, attempted_at: new Date() }, // Penalty: 0.5
    ]);
    const result = await calculateTopicMastery('u1', 't1', db);
    expect(result.masteryLevel).toBe(50); // 0.5 / 1.0
  });

  test('calculateTopicMastery - Recency weighting', async () => {
    // Create 21 items:
    // 0-19 (20 items): index < 20, weight 1.5. Let's make 1 correct.
    // 20 (1 item): index = 20, weight 1.0. Let's make it incorrect.
    const attempts = [];
    attempts.push({ is_correct: true, time_taken_seconds: 40, attempted_at: new Date() }); // Index 0, Correct, Weight 1.5
    for (let i = 1; i < 20; i++) {
      attempts.push({ is_correct: false, time_taken_seconds: 40, attempted_at: new Date() }); // Index 1-19, Incorrect, Weight 1.5
    }
    attempts.push({ is_correct: true, time_taken_seconds: 40, attempted_at: new Date(Date.now() - 86400000) }); // Index 20, Correct, Weight 1.0

    const db = mockDb(attempts);
    const result = await calculateTopicMastery('u1', 't1', db);
    
    // Calculation:
    // Recent Correct: 1 * 1.5 = 1.5
    // Recent Incorrect: 19 * 0.0 = 0
    // Old Correct: 1 * 1.0 = 1.0
    // Total Weighted Score: 1.5 + 1.0 = 2.5
    // Total Weight: (20 * 1.5) + (1 * 1.0) = 30 + 1 = 31
    // Accuracy: 2.5 / 31 = 0.0806... -> 8%
    
    expect(result.masteryLevel).toBe(8);
  });
});
