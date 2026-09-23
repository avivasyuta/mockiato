import { STORE_KEY } from '~/contstant';
import { TLog, TNetworkEvent, TStore, TStoreKey, TStoreMessage, TStoreMessageResponse, TUpdateStore } from '~/types';
import { createMutex } from '~/utils/createMutex';
import { withMockHitsAdded } from '~/utils/ratingPrompt';
import { emptyStore, mergeStoreWithDefaults, readStoreFromChromeStorage } from '~/utils/storeCore';

const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

const getLocalStorage = (): TStore | undefined => {
  const data = localStorage.getItem(STORE_KEY);
  return data ? JSON.parse(data) : undefined;
};

const writeStoreToLocalStorage = (store: TStore): void => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes('QUOTA_BYTES')
        ? 'Storage quota exceeded. Try removing unused mocks or logs to free up space.'
        : 'Failed to save data to storage.';
    throw new Error(message);
  }
};

// Dev mode (`npm run dev`) has no chrome.runtime/background worker to arbitrate writes,
// so concurrent read-modify-write cycles to localStorage are serialized locally instead.
const devMutex = createMutex();

const mutateLocalStorage = (mutate: (store: TStore) => TStore): Promise<TStore> =>
  devMutex(() => {
    const store = getLocalStorage() ?? emptyStore;
    const newStore = mutate(store);
    writeStoreToLocalStorage(newStore);
    return newStore;
  });

const sendStoreMessage = async (message: TStoreMessage): Promise<TStoreMessageResponse> => {
  const response = (await chrome.runtime.sendMessage(message)) as TStoreMessageResponse | undefined;
  return response ?? { ok: false, error: 'Failed to save data to storage.' };
};

export const getStore = async (): Promise<TStore> => {
  if (isDevelopment) {
    return getLocalStorage() ?? emptyStore;
  }

  return readStoreFromChromeStorage();
};

export const getUpdatedValue = <StoreKey extends TStoreKey>(
  update: TUpdateStore,
  key: StoreKey,
): TStore[StoreKey] | null => {
  const { newValue, oldValue } = update[STORE_KEY];
  const oldValString = JSON.stringify(oldValue[key]);
  const newValString = JSON.stringify(newValue[key]);

  if (oldValString === newValString) {
    return null;
  }

  return newValue[key];
};

export const getStoreValue = async <StoreKey extends TStoreKey>(key: StoreKey): Promise<TStore[StoreKey]> => {
  const store = await getStore();
  return store[key];
};

export const setStoreValue = async <StoreKey extends TStoreKey>(
  key: StoreKey,
  value: TStore[StoreKey],
): Promise<void> => {
  if (isDevelopment) {
    await mutateLocalStorage((store) => ({ ...store, [key]: value }));
    return;
  }

  const response = await sendStoreMessage({ type: 'store/setValue', key, value });
  if (!response.ok) {
    throw new Error(response.error);
  }
};

// Atomic append primitives: the write is computed inside the (locked) background worker
// rather than by the caller, so concurrent appends from overlapping intercepted requests
// can never clobber each other.
export const appendLog = async (log: TLog): Promise<void> => {
  if (isDevelopment) {
    await mutateLocalStorage((store) => ({ ...store, logs: [...store.logs, log] }));
    return;
  }

  const response = await sendStoreMessage({ type: 'store/appendLog', log });
  if (!response.ok) {
    throw new Error(response.error);
  }
};

export const appendNetworkEvent = async (event: TNetworkEvent): Promise<void> => {
  if (isDevelopment) {
    await mutateLocalStorage((store) => ({ ...store, network: [...store.network, event] }));
    return;
  }

  const response = await sendStoreMessage({ type: 'store/appendNetworkEvent', event });
  if (!response.ok) {
    throw new Error(response.error);
  }
};

export const initStore = async (): Promise<TStore> => {
  if (isDevelopment) {
    return mutateLocalStorage((store) => mergeStoreWithDefaults(store));
  }

  const response = await sendStoreMessage({ type: 'store/init' });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.store ?? emptyStore;
};

export const addMockHits = async (count: number): Promise<void> => {
  if (count <= 0) {
    return;
  }

  if (isDevelopment) {
    await mutateLocalStorage((store) => ({
      ...store,
      ratingPrompt: withMockHitsAdded(store.ratingPrompt, count),
    }));
    return;
  }

  const response = await sendStoreMessage({ type: 'store/addMockHits', count });
  if (!response.ok) {
    throw new Error(response.error);
  }
};
