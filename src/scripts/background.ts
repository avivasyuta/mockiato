import { TStoreMessage, TStoreMessageResponse } from '~/types';
import { createMutex } from '~/utils/createMutex';
import { isObject } from '~/utils/isObject';
import { withInstallRecorded, withMockHitsAdded, withUpdateRecorded } from '~/utils/ratingPrompt';
import { mergeStoreWithDefaults, readStoreFromChromeStorage, writeStoreToChromeStorage } from '~/utils/storeCore';

const withStoreLock = createMutex();

const isStoreMessage = (message: unknown): message is TStoreMessage =>
  isObject(message) &&
  typeof (message as TStoreMessage).type === 'string' &&
  (message as TStoreMessage).type.startsWith('store/');

const dispatchStoreMessage = async (message: TStoreMessage): Promise<TStoreMessageResponse> => {
  switch (message.type) {
    case 'store/setValue': {
      const store = await readStoreFromChromeStorage();
      await writeStoreToChromeStorage({ ...store, [message.key]: message.value });
      return { ok: true };
    }
    case 'store/appendLog': {
      const store = await readStoreFromChromeStorage();
      await writeStoreToChromeStorage({ ...store, logs: [...store.logs, message.log] });
      return { ok: true };
    }
    case 'store/appendNetworkEvent': {
      const store = await readStoreFromChromeStorage();
      await writeStoreToChromeStorage({ ...store, network: [...store.network, message.event] });
      return { ok: true };
    }
    case 'store/addMockHits': {
      const store = await readStoreFromChromeStorage();
      await writeStoreToChromeStorage({
        ...store,
        ratingPrompt: withMockHitsAdded(store.ratingPrompt, message.count),
      });
      return { ok: true };
    }
    case 'store/init': {
      const merged = mergeStoreWithDefaults(await readStoreFromChromeStorage());
      await writeStoreToChromeStorage(merged);
      return { ok: true, store: merged };
    }
    default:
      return { ok: false, error: 'Unknown store message type' };
  }
};

// Exported unwrapped so tests can drive it directly against a stubbed chrome.storage.local,
// without needing a real chrome.runtime message channel.
export const handleStoreMessage = (message: TStoreMessage): Promise<TStoreMessageResponse> =>
  withStoreLock(() =>
    dispatchStoreMessage(message).catch((error): TStoreMessageResponse => ({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to save data to storage.',
    })),
  );

// Reads/writes the store directly (under the same lock as `handleStoreMessage`) rather than
// going through a TStoreMessage: `onInstalled` only ever fires here, in the background
// context itself, so there's no cross-context call to route through chrome.runtime.
export const handleInstalled = (reason: 'install' | 'update'): Promise<void> =>
  withStoreLock(async () => {
    const store = await readStoreFromChromeStorage();
    const ratingPrompt =
      reason === 'install' ? withInstallRecorded(store.ratingPrompt) : withUpdateRecorded(store.ratingPrompt);

    await writeStoreToChromeStorage({ ...store, ratingPrompt });
  });

// `typeof` (not optional chaining) is required here: this module is imported directly in
// tests to drive `handleStoreMessage` without a real `chrome` global existing yet, and
// referencing an undeclared `chrome` identifier any other way throws a ReferenceError.
// In a real service worker `chrome`/`chrome.runtime` always exist.
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!isStoreMessage(message)) {
      return undefined;
    }

    handleStoreMessage(message).then(sendResponse);
    return true;
  });

  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install' || details.reason === 'update') {
      handleInstalled(details.reason);
    }
  });
}

export {};
