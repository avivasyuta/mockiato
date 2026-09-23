import { describe, expect, test } from 'vitest';

import { RatingPrompt } from '~/types';
import { withInstallRecorded, withMockHitsAdded, withUpdateRecorded } from '~/utils/ratingPrompt';

const base: RatingPrompt = {
  status: 'pending',
  mockHits: 0,
  dismissCount: 0,
};

describe('withInstallRecorded', () => {
  test('sets installedAt when unset', () => {
    const result = withInstallRecorded(base);
    expect(result.installedAt).toBeDefined();
  });

  test('leaves an existing installedAt untouched', () => {
    const ratingPrompt: RatingPrompt = { ...base, installedAt: 123 };
    expect(withInstallRecorded(ratingPrompt)).toEqual(ratingPrompt);
  });
});

describe('withUpdateRecorded', () => {
  test('sets updatedAt and backfills a missing installedAt', () => {
    const result = withUpdateRecorded(base);
    expect(result.updatedAt).toBeDefined();
    expect(result.installedAt).toBeDefined();
  });

  test('keeps an existing installedAt', () => {
    const ratingPrompt: RatingPrompt = { ...base, installedAt: 123 };
    expect(withUpdateRecorded(ratingPrompt).installedAt).toBe(123);
  });
});

describe('withMockHitsAdded', () => {
  test('adds the count to mockHits', () => {
    expect(withMockHitsAdded(base, 3).mockHits).toBe(3);
  });

  test('keeps accumulating with no upper limit while pending', () => {
    const ratingPrompt: RatingPrompt = { ...base, mockHits: 1000 };
    expect(withMockHitsAdded(ratingPrompt, 5).mockHits).toBe(1005);
  });

  test('is a no-op once the prompt reached a final status', () => {
    const rated: RatingPrompt = { ...base, status: 'rated', mockHits: 7 };
    const dismissed: RatingPrompt = { ...base, status: 'dismissed', mockHits: 7 };

    expect(withMockHitsAdded(rated, 5)).toEqual(rated);
    expect(withMockHitsAdded(dismissed, 5)).toEqual(dismissed);
  });

  test('is a no-op for a non-positive count', () => {
    expect(withMockHitsAdded(base, 0)).toEqual(base);
  });
});
