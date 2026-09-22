import { STORE_KEY } from '~/contstant';
import { TStore, TStoreKey } from '~/types';

import { isObject } from './isObject';

export const emptyStore: TStore = {
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

export const readStoreFromChromeStorage = async (): Promise<TStore> => {
  const response = await chrome.storage.local.get(STORE_KEY);
  return (response[STORE_KEY] as TStore | undefined) ?? emptyStore;
};

export const writeStoreToChromeStorage = async (store: TStore): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORE_KEY]: store });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('QUOTA_BYTES')
        ? 'Storage quota exceeded. Try removing unused mocks or logs to free up space.'
        : 'Failed to save data to storage.';
    throw new Error(message);
  }
};

export const mergeStoreWithDefaults = <StoreKey extends TStoreKey = TStoreKey>(
  existing: TStore | undefined,
): TStore => {
  const initialStore = structuredClone(emptyStore);
  const store = existing ?? emptyStore;

  Object.keys(initialStore).forEach((key) => {
    const k = key as StoreKey;
    const existingValue = store[k];

    if (existingValue && k !== 'network') {
      if (isObject(existingValue)) {
        initialStore[k] = { ...initialStore[k], ...existingValue };
      } else {
        initialStore[k] = existingValue;
      }
    }
  });

  return initialStore;
};
