// Coalesces many rapid notify() calls into a single onFlush(count), so a page
// issuing lots of mocked requests in a row doesn't trigger a write per request.
export const createMockHitsBatcher = (onFlush: (count: number) => void, delayMs = 1000) => {
  let pendingCount = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;

    if (pendingCount === 0) {
      return;
    }

    const count = pendingCount;
    pendingCount = 0;
    onFlush(count);
  };

  return () => {
    pendingCount += 1;

    if (timer === null) {
      timer = setTimeout(flush, delayMs);
    }
  };
};
