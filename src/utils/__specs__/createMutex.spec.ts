import { describe, expect, test } from 'vitest';

import { createMutex } from '~/utils/createMutex';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

describe('createMutex', () => {
  test('runs queued tasks strictly in arrival order, even when unawaited', async () => {
    const withLock = createMutex();
    const order: number[] = [];

    const runTask = (id: number, ms: number) =>
      withLock(async () => {
        await delay(ms);
        order.push(id);
      });

    // Intentionally not awaited between calls, and the earlier tasks have a longer delay,
    // so without serialization the shorter-delay tasks would finish first.
    const tasks = [runTask(1, 30), runTask(2, 10), runTask(3, 5)];

    await Promise.all(tasks);

    expect(order).toEqual([1, 2, 3]);
  });

  test('never runs two tasks concurrently', async () => {
    const withLock = createMutex();
    let running = 0;
    let maxConcurrent = 0;

    const runTask = () =>
      withLock(async () => {
        running += 1;
        maxConcurrent = Math.max(maxConcurrent, running);
        await delay(5);
        running -= 1;
      });

    await Promise.all([runTask(), runTask(), runTask(), runTask()]);

    expect(maxConcurrent).toBe(1);
  });

  test('a rejected task does not break the queue for subsequent tasks', async () => {
    const withLock = createMutex();
    const order: string[] = [];

    const failingTask = withLock(async () => {
      order.push('failing');
      throw new Error('boom');
    });

    const nextTask = withLock(async () => {
      order.push('next');
      return 'ok';
    });

    await expect(failingTask).rejects.toThrow('boom');
    await expect(nextTask).resolves.toBe('ok');
    expect(order).toEqual(['failing', 'next']);
  });

  test('resolves each task with its own return value', async () => {
    const withLock = createMutex();

    const a = withLock(() => 'a');
    const b = withLock(async () => 'b');

    await expect(a).resolves.toBe('a');
    await expect(b).resolves.toBe('b');
  });
});
