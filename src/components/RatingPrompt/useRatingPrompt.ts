import { useEffect, useState } from 'react';

import { RATING_PROMPT_CONFIG } from '~/contstant';
import { getRatingPromptDebugForceShow } from '~/utils/getRatingPromptDebugForceShow';
import { logError } from '~/utils/logger';
import { shouldShowRatingPrompt } from '~/utils/shouldShowRatingPrompt';
import { getStoreValue, setStoreValue } from '~/utils/storage';

type UseRatingPromptResult = {
  isVisible: boolean;
  mockHits: number;
  onRate: () => void;
  onDismiss: () => void;
};

export const useRatingPrompt = (): UseRatingPromptResult => {
  const [isVisible, setIsVisible] = useState(false);
  const [mockHits, setMockHits] = useState(0);

  // Eligibility is checked once, at mount, on purpose: if conditions become
  // true later in an already-open panel, the prompt should wait for the next open.
  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const [ratingPrompt, mocks, debugForceShow] = await Promise.all([
          getStoreValue('ratingPrompt'),
          getStoreValue('mocks'),
          getRatingPromptDebugForceShow(),
        ]);

        if (cancelled) {
          return;
        }

        const now = Date.now();
        const mocksCount = mocks?.length ?? 0;
        const shouldShow = debugForceShow || shouldShowRatingPrompt(ratingPrompt, mocksCount, now);

        if (!shouldShow) {
          return;
        }

        setMockHits(ratingPrompt.mockHits);
        setIsVisible(true);
      } catch (err) {
        logError(err);
      }
    };

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  const onDismiss = async () => {
    setIsVisible(false);

    try {
      const ratingPrompt = await getStoreValue('ratingPrompt');
      const dismissCount = ratingPrompt.dismissCount + 1;

      if (dismissCount >= RATING_PROMPT_CONFIG.maxDismissCount) {
        await setStoreValue('ratingPrompt', { ...ratingPrompt, dismissCount, status: 'dismissed' });
        return;
      }

      await setStoreValue('ratingPrompt', {
        ...ratingPrompt,
        dismissCount,
        nextShowAt: Date.now() + RATING_PROMPT_CONFIG.snoozeCooldownMs,
      });
    } catch (err) {
      logError(err);
    }
  };

  const onRate = async () => {
    setIsVisible(false);

    try {
      const ratingPrompt = await getStoreValue('ratingPrompt');
      await setStoreValue('ratingPrompt', { ...ratingPrompt, status: 'rated' });
    } catch (err) {
      logError(err);
    }
  };

  return { isVisible, mockHits, onRate, onDismiss };
};
