import { TStore } from '../types';
import { STORE_KEY } from '../contstant';

export const getStore = async (): Promise<TStore | null> => {
    let store;
    // TODO extension content invalidated
    try {
        store = await chrome.storage.local.get(STORE_KEY);
    } catch (_) {
        return null;
    }

    return store[STORE_KEY] as TStore;
};
