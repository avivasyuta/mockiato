import { listenMessage, sendMessage } from '../services/message';
import { TInterceptedRequestMockDTO, TLog, TInterceptedRequestDTO } from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';
import { getValidMocks } from '../utils/getValidMocks';
import { getValidHeaders } from '../utils/getValidHeaders';
import { getStore } from '../utils/storage';
import { removeStack } from '../services/alert';

listenMessage<TInterceptedRequestDTO>('requestIntercepted', async (message) => {
    try {
        const store = await getStore();
        const { origin } = window.location;

        const headers = getValidHeaders({
            headerProfiles: store.headersProfiles,
            origin: window.location.origin,
            url: message.url,
            method: message.method,
            type: 'request',
        });

        if (!store?.mocks) {
            sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
                messageId: message.messageId,
                headers,
            });
            return;
        }

        const mocks = getValidMocks({
            mocks: store.mocks,
            url: message.url,
            method: message.method,
            origin,
        });

        if (mocks.length === 0) {
            sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
                messageId: message.messageId,
                headers,
            });
            return;
        }

        const mock = mocks[0];

        sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
            messageId: message.messageId,
            mock,
            headers,
        });

        const log: TLog = {
            url: message.url,
            method: message.method,
            date: new Date().toISOString(),
            host: window.location.hostname,
            mock,
        };

        await chrome.storage.local.set({
            [STORE_KEY]: {
                ...store,
                logs: [...(store.logs ?? []), log],
            },
        });
    } catch (err) {
        // TODO сделать логгер
        console.log('Mockiato error', err);
        sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
            messageId: message.messageId,
            headers: {},
        });
    }
});

const destroy = () => {
    const script = document.getElementById(INTERCEPTOR_ID);
    script?.parentNode?.removeChild(script);

    // TODO он тут должен быть?
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
