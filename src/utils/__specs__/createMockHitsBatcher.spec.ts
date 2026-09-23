import { describe, expect, test } from 'vitest';

import { createMockHitsBatcher } from '~/utils/createMockHitsBatcher';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('createMockHitsBatcher', () => {
  test('coalesces rapid notify() calls into a single onFlush with the total count', async () => {
    const flushes: number[] = [];
    const notify = createMockHitsBatcher((count) => flushes.push(count), 20);

    notify();
    notify();
    notify();

    expect(flushes).toEqual([]);
    await delay(30);

    expect(flushes).toEqual([3]);
  });

  test('a second burst after a flush produces its own separate flush', async () => {
    const flushes: number[] = [];
    const notify = createMockHitsBatcher((count) => flushes.push(count), 20);

    notify();
    notify();
    await delay(30);

    notify();
    await delay(30);

    expect(flushes).toEqual([2, 1]);
  });

  test('does not flush when notify() is never called', async () => {
    const flushes: number[] = [];
    createMockHitsBatcher((count) => flushes.push(count), 20);

    await delay(30);

    expect(flushes).toEqual([]);
  });
});
