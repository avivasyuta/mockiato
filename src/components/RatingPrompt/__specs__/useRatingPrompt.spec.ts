import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { HttpMethodType, RatingPrompt, TMock } from '~/types';
import { getStore } from '~/utils/storage';

import { useRatingPrompt } from '../useRatingPrompt';

const DAY_MS = 24 * 60 * 60 * 1000;

const buildMock = (id: string): TMock => ({
  id,
  url: `/url-${id}`,
  urlType: 'url',
  httpMethod: HttpMethodType.GET,
  httpStatusCode: 200,
  delay: 0,
  responseType: 'json',
  responseHeaders: [],
  isActive: true,
});

const eligibleRatingPrompt: RatingPrompt = {
  status: 'pending',
  mockHits: 5,
  dismissCount: 0,
  installedAt: Date.now() - 8 * DAY_MS,
};

const seedEligibleStore = () =>
  setupChromeStorageMock(
    {
      ratingPrompt: eligibleRatingPrompt,
      mocks: [buildMock('1'), buildMock('2')],
    },
    { delayMs: 10 },
  );

describe('useRatingPrompt', () => {
  beforeEach(() => {
    seedEligibleStore();
  });

  test('shows the prompt when eligibility conditions are met', async () => {
    const { result } = renderHook(() => useRatingPrompt());

    await waitFor(() => expect(result.current.isVisible).toBe(true));
    expect(result.current.mockHits).toBe(eligibleRatingPrompt.mockHits);
  });

  test('onRate hides the prompt and permanently sets status to rated', async () => {
    const { result } = renderHook(() => useRatingPrompt());
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    await act(async () => {
      await result.current.onRate();
    });

    expect(result.current.isVisible).toBe(false);

    const store = await getStore();
    expect(store.ratingPrompt.status).toBe('rated');
  });

  test('a first dismissal (X or report) only snoozes the prompt', async () => {
    const { result } = renderHook(() => useRatingPrompt());
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    await act(async () => {
      await result.current.onDismiss();
    });

    expect(result.current.isVisible).toBe(false);

    const store = await getStore();
    expect(store.ratingPrompt.status).toBe('pending');
    expect(store.ratingPrompt.dismissCount).toBe(1);
    expect(store.ratingPrompt.nextShowAt).toBeDefined();
    expect(store.ratingPrompt.nextShowAt).toBeGreaterThan(Date.now());
  });

  test('a second dismissal (X or report) in a row stops the prompt for good', async () => {
    const { result } = renderHook(() => useRatingPrompt());
    await waitFor(() => expect(result.current.isVisible).toBe(true));

    await act(async () => {
      await result.current.onDismiss();
    });

    await act(async () => {
      await result.current.onDismiss();
    });

    const store = await getStore();
    expect(store.ratingPrompt.status).toBe('dismissed');
    expect(store.ratingPrompt.dismissCount).toBe(2);
  });

  test('reopening without interacting does not write state and shows the prompt again', async () => {
    const first = renderHook(() => useRatingPrompt());
    await waitFor(() => expect(first.result.current.isVisible).toBe(true));
    first.unmount();

    const storeAfterFirstOpen = await getStore();
    expect(storeAfterFirstOpen.ratingPrompt).toEqual(eligibleRatingPrompt);

    const second = renderHook(() => useRatingPrompt());
    await waitFor(() => expect(second.result.current.isVisible).toBe(true));
  });
});
