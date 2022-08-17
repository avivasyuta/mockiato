import { listenMessage, sendMessage } from '../services/message';
import { TMockResponseDTO, TRequest, TStore } from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';

listenMessage<TRequest>('intercepted', async (request) => {
    let store;
    // TODO extension content invalidated
    try {
        store = await chrome.storage.local.get(STORE_KEY);
    } catch (_) {
        return;
    }

    const extStore = store[STORE_KEY] as TStore;
    if (extStore?.mocks) {
        const mocks = extStore.mocks.filter((mock) => mock.isActive
            && request.url.startsWith(mock.url)
            && mock.httpMethod === request.method);

        if (mocks.length === 0) {
            sendMessage<TMockResponseDTO>('mockChecked', {
                messageId: request.messageId,
            });
            return;
        }

        const mock = mocks[0];

        chrome.storage.local.set({
            [STORE_KEY]: {
                ...extStore,
                logs: [
                    ...(extStore.logs ?? []),
                    {
                        request,
                        mock,
                        date: new Date().toLocaleString(),
                    },
                ],
            },
        });

        sendMessage<TMockResponseDTO>('mockChecked', {
            messageId: request.messageId,
            mock,
        });
    } else {
        sendMessage<TMockResponseDTO>('mockChecked', {
            messageId: request.messageId,
        });
    }
});

const destroy = () => {
    const script = document.getElementById(INTERCEPTOR_ID);
    script?.parentNode?.removeChild(script);
};

export const main = () => {
    // Inject new script to user's DOM
    const s = document.createElement('script');
    s.id = INTERCEPTOR_ID;
    s.src = chrome.runtime.getURL('interceptor.js');
    (document.head || document.documentElement).appendChild(s);
};

destroy();
main();
