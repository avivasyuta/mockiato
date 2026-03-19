import { useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';
import { TStore, TStoreKey, TUpdateStore } from '~/types';
import { getStoreValue, getUpdatedValue, setStoreValue } from '~/utils/storage';

// eslint-disable-next-line max-len
export const useStore = <Key extends TStoreKey>(
    key: Key,
): [TStore[Key] | null, (val: TStore[Key]) => Promise<void>] => {
    const [value, setValue] = useState<TStore[Key] | null>(null);

    const updateValue = async (val: TStore[Key]): Promise<void> => {
        setValue(val);
        try {
            await setStoreValue(key, val);
            window.dispatchEvent(new Event('storage'));
        } catch (error) {
            showNotification({
                message: error instanceof Error ? error.message : 'Failed to save data',
                color: 'red',
            });
        }
    };

    if (chrome.storage) {
        chrome.storage.onChanged.addListener(async (data) => {
            const newValue = getUpdatedValue(data as TUpdateStore, key);
            if (newValue) {
                setValue(newValue);
            }
        });
    }

    const handleChangeStore = () => {
        getStoreValue(key).then((data) => {
            setValue(data);
        });
    };

    useEffect(() => {
        handleChangeStore();

        window.addEventListener('storage', handleChangeStore);
        return () => window.removeEventListener('storage', handleChangeStore);
    }, [key]);

    return [value, updateValue];
};
