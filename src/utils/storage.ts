import { TStore, TStoreKey, TUpdateStore } from '~/types';
import { STORE_KEY } from '~/contstant';
import { isObject } from './isObject';

const emptyStore: TStore = {
    mocks: [],
    mockGroups: [],
    logs: [],
    headersProfiles: {},
    network: [],
    settings: {
        showNotifications: true,
        showActiveStatus: true,
        excludedHosts: [],
        enabledHosts: {},
    },
};

const getLocalStorage = (): TStore | undefined => {
    const data = localStorage.getItem(STORE_KEY);
    return data ? JSON.parse(data) : undefined;
};

const getExtensionStore = async (): Promise<TStore | undefined> => {
    const response = await chrome.storage.local.get(STORE_KEY);
    return response[STORE_KEY] as TStore;
};

export const getStore = async (): Promise<TStore> => {
    let store: TStore | undefined;

    if (import.meta.env.VITE_NODE_ENV === 'development') {
        store = getLocalStorage();
    } else {
        store = await getExtensionStore();
    }

    return store ?? emptyStore;
};

export const setStore = async (store: TStore): Promise<void> => {
    if (import.meta.env.VITE_NODE_ENV === 'development') {
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

export const initStore = async <StoreKey extends TStoreKey>(): Promise<TStore> => {
    const initialStore = structuredClone(emptyStore);
    const store = await getStore();

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

    await setStore(initialStore);
    return initialStore;
};
