import { describe, expect, test } from 'vitest';

import { RatingPrompt } from '~/types';
import { shouldShowRatingPrompt } from '~/utils/shouldShowRatingPrompt';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 0, 15);

const fullyEligible: RatingPrompt = {
  status: 'pending',
  mockHits: 5,
  dismissCount: 0,
  installedAt: NOW - 8 * DAY_MS,
};

describe('shouldShowRatingPrompt', () => {
  test('returns true when every condition is satisfied', () => {
    expect(shouldShowRatingPrompt(fullyEligible, 2, NOW)).toBe(true);
  });

  test('returns false when less than 7 days passed since install', () => {
    const ratingPrompt: RatingPrompt = { ...fullyEligible, installedAt: NOW - 6 * DAY_MS };
    expect(shouldShowRatingPrompt(ratingPrompt, 2, NOW)).toBe(false);
  });

  test('returns false when fewer than 2 mocks are saved', () => {
    expect(shouldShowRatingPrompt(fullyEligible, 1, NOW)).toBe(false);
  });

  test('returns false when mocks have fired fewer than 5 times', () => {
    const ratingPrompt: RatingPrompt = { ...fullyEligible, mockHits: 4 };
    expect(shouldShowRatingPrompt(ratingPrompt, 2, NOW)).toBe(false);
  });

  test('returns false when status is not pending', () => {
    const rated: RatingPrompt = { ...fullyEligible, status: 'rated' };
    const dismissed: RatingPrompt = { ...fullyEligible, status: 'dismissed' };

    expect(shouldShowRatingPrompt(rated, 2, NOW)).toBe(false);
    expect(shouldShowRatingPrompt(dismissed, 2, NOW)).toBe(false);
  });

  test('returns false when nextShowAt is in the future', () => {
    const ratingPrompt: RatingPrompt = { ...fullyEligible, nextShowAt: NOW + DAY_MS };
    expect(shouldShowRatingPrompt(ratingPrompt, 2, NOW)).toBe(false);
  });

  test('returns true when nextShowAt is in the past', () => {
    const ratingPrompt: RatingPrompt = { ...fullyEligible, nextShowAt: NOW - DAY_MS };
    expect(shouldShowRatingPrompt(ratingPrompt, 2, NOW)).toBe(true);
  });

  test('an existing user without installedAt after an update is not shown before 7 days pass', () => {
    // Simulates onInstalled('update') backfilling installedAt = now for a pre-existing user.
    const backfilledNow = NOW;
    const atBackfill: RatingPrompt = { ...fullyEligible, installedAt: backfilledNow };

    expect(shouldShowRatingPrompt(atBackfill, 2, backfilledNow)).toBe(false);
    expect(shouldShowRatingPrompt(atBackfill, 2, backfilledNow + 6 * DAY_MS)).toBe(false);
    expect(shouldShowRatingPrompt(atBackfill, 2, backfilledNow + 7 * DAY_MS)).toBe(true);
  });
});
