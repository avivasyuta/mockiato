import { STORE_KEY } from '~/contstant';
import { handleStoreMessage } from '~/scripts/background';
import { TStore, TStoreMessage } from '~/types';
import { delay } from '~/utils/delay';
import { emptyStore } from '~/utils/storeCore';

type SetupChromeStorageMockOptions = {
  // Simulates real chrome.storage.local latency: with a non-zero delay, get/set don't resolve
  // instantly, so overlapping read-modify-write cycles reliably interleave instead of just
  // happening to race depending on microtask timing — needed by specs that specifically test
  // concurrent-write behavior.
  delayMs?: number;
};

/**
 * `useStore` reads via `chrome.storage.local` directly and writes via `chrome.runtime.sendMessage`
 * to the background service worker (see src/utils/storage.ts / src/scripts/background.ts, which
 * only falls back to `localStorage` when VITE_NODE_ENV === 'development'). Component tests run
 * with neither `chrome` nor that env var defined, so we stub the extension storage + messaging API,
 * routing `sendMessage` through the real `handleStoreMessage` handler so writes behave exactly as
 * they do in the real background worker.
 */
export const setupChromeStorageMock = (
  initialStore: Partial<TStore> = {},
  { delayMs = 0 }: SetupChromeStorageMockOptions = {},
) => {
  let backingStore: TStore = { ...emptyStore, ...initialStore };

  const listeners = new Set<(changes: unknown) => void>();

  (globalThis as unknown as { chrome: unknown }).chrome = {
    runtime: {
      sendMessage: async (message: TStoreMessage) => handleStoreMessage(message),
    },
    storage: {
      local: {
        get: async () => {
          if (delayMs) await delay(delayMs);
          return { [STORE_KEY]: backingStore };
        },
        set: async (items: Record<string, unknown>) => {
          if (delayMs) await delay(delayMs);
          const oldValue = backingStore;
          backingStore = items[STORE_KEY] as TStore;
          listeners.forEach((listener) => listener({ [STORE_KEY]: { newValue: backingStore, oldValue } }));
        },
      },
      onChanged: {
        addListener: (listener: (changes: unknown) => void) => {
          listeners.add(listener);
        },
        removeListener: (listener: (changes: unknown) => void) => {
          listeners.delete(listener);
        },
      },
    },
  };

  return {
    getStore: () => backingStore,
  };
};
