import { STORE_KEY } from '~/contstant';
import { TStore } from '~/types';

const emptyStore: TStore = {
  mocks: [],
  mockGroups: [],
  logs: [],
  headersProfiles: {},
  network: [],
  settings: {
    showNotifications: true,
    showActiveStatus: true,
    enabledHosts: {},
    showMobileNavBar: false,
    commentDisplayMode: 'tooltip',
    displayHttpMethodInline: false,
  },
};

/**
 * `useStore` reads/writes via `chrome.storage.local` (see src/utils/storage.ts, which only
 * falls back to `localStorage` when VITE_NODE_ENV === 'development'). Component tests run
 * with neither `chrome` nor that env var defined, so we stub the extension storage API.
 */
export const setupChromeStorageMock = (initialStore: Partial<TStore> = {}) => {
  let backingStore: TStore = { ...emptyStore, ...initialStore };

  const listeners = new Set<(changes: unknown) => void>();

  (globalThis as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: async () => ({ [STORE_KEY]: backingStore }),
        set: async (items: Record<string, unknown>) => {
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
