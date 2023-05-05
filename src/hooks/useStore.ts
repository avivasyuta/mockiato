import { useEffect, useState } from 'react';
import { TStore, TStoreKey, TUpdateStore } from '../types';
import { getStoreValue, getUpdatedValue, setStoreValue } from '../utils/storage';

export const useStore = <Key extends TStoreKey>(key: Key): [TStore[Key] | null, (val: TStore[Key]) => void] => {
    const [value, setValue] = useState<TStore[Key] | null>(null);

    const updateValue = async (val: TStore[Key]): Promise<void> => {
        setValue(val);
        await setStoreValue(key, val);
    };

    if (chrome.storage) {
        chrome.storage.onChanged.addListener(async (data) => {
            const newValue = getUpdatedValue(data as TUpdateStore, key);
            if (newValue) {
                setValue(newValue);
            }
        });
    }

    useEffect(() => {
        getStoreValue(key).then((data) => {
            setValue(data);
        });
    }, [key]);

    return [value, updateValue];
};
