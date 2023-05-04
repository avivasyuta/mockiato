import { listenMessage, sendMessage } from '../services/message';
import { TLog, TMockResponseDTO, TRequest } from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';
import { getValidMocks } from '../utils';
import { removeStack } from '../services/alert';
import { getStore } from '../utils/storage';

listenMessage<TRequest>('intercepted', async (request) => {
    const store = await getStore();

    if (!store?.mocks) {
        sendMessage<TMockResponseDTO>('mockChecked', {
            messageId: request.messageId,
        });
        return;
    }

    const mocks = getValidMocks(store.mocks, request, window.location.origin);

    if (mocks.length === 0) {
        sendMessage<TMockResponseDTO>('mockChecked', {
            messageId: request.messageId,
        });
        return;
    }

    const mock = mocks[0];

    sendMessage<TMockResponseDTO>('mockChecked', {
        messageId: request.messageId,
        mock,
    });

    const log: TLog = {
        request,
        mock,
        date: new Date().toLocaleString(),
        host: window.location.hostname,
    };

    await chrome.storage.local.set({
        [STORE_KEY]: {
            ...store,
            logs: [...(store.logs ?? []), log],
        },
    });
});

const destroy = () => {
    const script = document.getElementById(INTERCEPTOR_ID);
    script?.parentNode?.removeChild(script);

    removeStack();
};

export const main = () => {
    // Inject mockiato script to user's DOM
    const s = document.createElement('script');
    s.id = INTERCEPTOR_ID;
    s.src = chrome.runtime.getURL('mockiato.js');
    (document.head || document.documentElement).appendChild(s);
};

destroy();
main();
