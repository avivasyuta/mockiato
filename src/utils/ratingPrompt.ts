import { RatingPrompt } from '~/types';

export const withInstallRecorded = (ratingPrompt: RatingPrompt): RatingPrompt => {
  if (ratingPrompt.installedAt !== undefined) {
    return ratingPrompt;
  }

  return { ...ratingPrompt, installedAt: Date.now() };
};

export const withUpdateRecorded = (ratingPrompt: RatingPrompt): RatingPrompt => ({
  ...ratingPrompt,
  updatedAt: Date.now(),
  installedAt: ratingPrompt.installedAt ?? Date.now(),
});

export const withMockHitsAdded = (ratingPrompt: RatingPrompt, count: number): RatingPrompt => {
  // Hits only matter while the prompt can still be shown; 'rated' / 'dismissed' are final.
  if (count <= 0 || ratingPrompt.status !== 'pending') {
    return ratingPrompt;
  }

  return { ...ratingPrompt, mockHits: ratingPrompt.mockHits + count };
};
