/**
 * NTA scoring logic extracted for pure unit testing
 * (same logic as used in mocktest.controller.js)
 */
const NTA = { CORRECT: 4, WRONG: -1 / 3, SKIP: 0 };

const scoreAnswer = (selected, correct) => {
  if (!selected)              return { score: NTA.SKIP,    isCorrect: false };
  if (selected === correct)   return { score: NTA.CORRECT, isCorrect: true  };
  return                             { score: NTA.WRONG,   isCorrect: false };
};

const calcTotal = (answers) =>
  Math.max(0, answers.reduce((sum, a) => sum + scoreAnswer(a.selected, a.correct).score, 0));

describe('NTA Scoring', () => {

  test('correct answer → +4', () => {
    expect(scoreAnswer('A', 'A').score).toBe(4);
    expect(scoreAnswer('A', 'A').isCorrect).toBe(true);
  });

  test('wrong answer → -1/3', () => {
    const result = scoreAnswer('B', 'A');
    expect(result.score).toBeCloseTo(-0.333, 3);
    expect(result.isCorrect).toBe(false);
  });

  test('skipped → 0', () => {
    expect(scoreAnswer(null, 'A').score).toBe(0);
    expect(scoreAnswer(null, 'A').isCorrect).toBe(false);
  });

  test('total score clamped to 0 minimum', () => {
    // 5 wrong → 5 × (-1/3) = -1.667 → clamped to 0
    const answers = Array(5).fill({ selected: 'B', correct: 'A' });
    expect(calcTotal(answers)).toBe(0);
  });

  test('180 all correct → 720 (NEET max)', () => {
    const answers = Array(180).fill({ selected: 'A', correct: 'A' });
    expect(calcTotal(answers)).toBe(720);
  });

  test('mixed: 90 correct, 45 wrong, 45 skip', () => {
    const correct = Array(90).fill({ selected: 'A', correct: 'A' });
    const wrong   = Array(45).fill({ selected: 'B', correct: 'A' });
    const skipped = Array(45).fill({ selected: null, correct: 'A' });
    const score   = calcTotal([...correct, ...wrong, ...skipped]);
    // 90×4 + 45×(-1/3) = 360 - 15 = 345
    expect(score).toBeCloseTo(345, 1);
  });
});
