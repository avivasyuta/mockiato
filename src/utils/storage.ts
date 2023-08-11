import { TStore, TStoreKey, TUpdateStore } from '../types';
import { STORE_KEY } from '../contstant';

const emptyStore: TStore = {
    mocks: [],
    logs: [],
    headersProfiles: {},
    network: [],
};

const getLocalStorage = (): TStore | undefined => {
    const data = localStorage.getItem(STORE_KEY) || '{}';
    return JSON.parse(data);
};

const getExtensionStore = async (): Promise<TStore | undefined> => {
    const response = await chrome.storage.local.get(STORE_KEY);
    return response[STORE_KEY] as TStore;
};

export const getStore = async (): Promise<TStore> => {
    let store: TStore | undefined;

    if (process.env.NODE_ENV === 'development') {
        store = getLocalStorage();
    } else {
        store = await getExtensionStore();
    }

    return store ?? emptyStore;
};

export const setStore = async (store: TStore): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } else {
        await chrome.storage.local.set({ [STORE_KEY]: store });
    }
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
    const store = await getStore();

    const newStore: TStore = {
        ...store,
        [key]: value,
    };

    await setStore(newStore);
};

export const initStore = async <StoreKey extends TStoreKey>(initialValue: TStore): Promise<void> => {
    const store = await getStore();

    const newStore: TStore = { ...initialValue };

    Object.keys(initialValue).forEach((key) => {
        const k = key as StoreKey;
        if (store[k]) {
            newStore[k] = store[k];
        }
    });

    newStore.network = [];

    await setStore(newStore);
};
