import { useEffect, useState } from 'react';
import { TStore, TStoreKey, TUpdateStore } from '~/types';
import { getStoreValue, getUpdatedValue, setStoreValue } from '~/utils/storage';

// eslint-disable-next-line max-len
export const useStore = <Key extends TStoreKey>(
    key: Key,
): [TStore[Key] | null, (val: TStore[Key]) => Promise<void>] => {
    const [value, setValue] = useState<TStore[Key] | null>(null);

    const updateValue = async (val: TStore[Key]): Promise<void> => {
        setValue(val);
        await setStoreValue(key, val);
        window.dispatchEvent(new Event('storage'));
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
