import { useEffect, useState } from 'react';
import { showNotification } from '@mantine/notifications';

import { TStore, TStoreKey, TUpdateStore } from '~/types';
import { getStoreValue, getUpdatedValue, setStoreValue } from '~/utils/storage';

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

  useEffect(() => {
    const handleChangeStore = () => {
      getStoreValue(key).then((data) => {
        setValue(data);
      });
    };

    const handleStorageChanged = (data: Record<string, unknown>) => {
      const newValue = getUpdatedValue(data as TUpdateStore, key);
      if (newValue) {
        setValue(newValue);
      }
    };

    handleChangeStore();

    window.addEventListener('storage', handleChangeStore);
    if (chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChanged);
    }

    return () => {
      window.removeEventListener('storage', handleChangeStore);
      if (chrome.storage) {
        chrome.storage.onChanged.removeListener(handleStorageChanged);
      }
    };
  }, [key]);

  return [value, updateValue];
};
