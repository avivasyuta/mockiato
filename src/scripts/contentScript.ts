import { listenMessage, sendMessage } from '../services/message';
import { TInterceptedRequestDTO, TLog, TRequest } from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';
import { getValidMocks } from '../utils/getValidMocks';
import { getValidHeaders } from '../utils/getValidHeaders';
import { getStore } from '../utils/storage';
import { removeStack } from '../services/alert';

listenMessage<TRequest>('intercepted', async (request) => {
    const store = await getStore();

    const headers = getValidHeaders({
        headerProfiles: store.headersProfiles,
        origin: window.location.origin,
        request,
        type: 'request',
    });

    if (!store?.mocks) {
        sendMessage<TInterceptedRequestDTO>('requestChecked', {
            messageId: request.messageId,
            headers,
        });
        return;
    }

    const mocks = getValidMocks(store.mocks, request, window.location.origin);

    if (mocks.length === 0) {
        sendMessage<TInterceptedRequestDTO>('requestChecked', {
            messageId: request.messageId,
            headers,
        });
        return;
    }

    const mock = mocks[0];

    sendMessage<TInterceptedRequestDTO>('requestChecked', {
        messageId: request.messageId,
        headers,
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
