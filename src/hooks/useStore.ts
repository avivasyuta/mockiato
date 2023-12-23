import { useEffect, useState } from 'react';
import { TStore, TStoreKey, TUpdateStore } from '../types';
import { getStoreValue, getUpdatedValue, setStoreValue } from '../utils/storage';

export const useStore = <Key extends TStoreKey>(key: Key, defaultValue: TStore[Key]): [TStore[Key], (val: TStore[Key]) => Promise<void>] => {
    const [value, setValue] = useState<TStore[Key]>();

    const updateValue = async (val: TStore[Key]): Promise<void> => {
        setValue(val);
        await setStoreValue(key, val);
        window.dispatchEvent(new Event("storage"));
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
            console.log('key', key, 'value', data)
            setValue(data);
        });
    }

    useEffect(() => {
        console.log('init store for ', key)
        handleChangeStore()

        window.addEventListener("storage", handleChangeStore);
        return () => window.removeEventListener("storage", handleChangeStore);
    }, [key]);

    return [value ?? defaultValue, updateValue];
};
