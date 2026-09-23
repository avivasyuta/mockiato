import { RATING_PROMPT_CONFIG } from '~/contstant';
import { RatingPrompt } from '~/types';

export const shouldShowRatingPrompt = (ratingPrompt: RatingPrompt, mocksCount: number, now: number): boolean => {
  if (ratingPrompt.status !== 'pending') {
    return false;
  }

  if (ratingPrompt.nextShowAt !== undefined && now < ratingPrompt.nextShowAt) {
    return false;
  }

  if (
    ratingPrompt.installedAt === undefined ||
    now - ratingPrompt.installedAt < RATING_PROMPT_CONFIG.minDaysSinceInstallMs
  ) {
    return false;
  }

  if (mocksCount < RATING_PROMPT_CONFIG.minMocksCount) {
    return false;
  }

  if (ratingPrompt.mockHits < RATING_PROMPT_CONFIG.minMockHitsToShow) {
    return false;
  }

  return true;
};
