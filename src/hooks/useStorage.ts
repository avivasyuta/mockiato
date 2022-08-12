import { useEffect, useState } from 'react';

const getItem = async <T>(key: string): Promise<T | null> => {
    if (process.env.NODE_ENV === 'development') {
        try {
            const data = localStorage.getItem(key) || '';
            return JSON.parse(data);
        } catch (_) {
            return null;
        }
    } else {
        try {
            const store = await chrome.storage.local.get(key);
            return store[key] as T || null;
        } catch (_) {
            return null;
        }
    }
};

const setItem = async <T>(key: string, data: T): Promise<void> => {
    if (process.env.NODE_ENV === 'development') {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            // eslint-disable-next-line no-empty
        } catch (_) {}
    } else {
        try {
            await chrome.storage.local.set({ [key]: data });
            // eslint-disable-next-line no-empty
        } catch (_) {}
    }
};

export const useStorage = <T>(key: string, initialValue: T): [T, (value: T) => void] => {
    const [storedValue, setStoredValue] = useState<T>(initialValue);

    const setValue = async (value: T) => {
        try {
            await setItem(key, value);
            setStoredValue(value);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    };

    if (chrome.storage) {
        chrome.storage.onChanged.addListener(async () => {
            const data = await getItem<T>(key);
            if (data) {
                setStoredValue(data);
            }
        });
    }

    useEffect(() => {
        try {
            getItem<T>(key).then((data) => {
                if (!data) {
                    setItem(key, initialValue).then();
                    setStoredValue(initialValue);
                } else {
                    setStoredValue(data);
                }
            });
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log(error);
        }
    }, []);

    return [storedValue, setValue];
};
