import { listenMessage, sendMessage } from '../services/message';
import {
    TInterceptedRequestMockDTO,
    TLog,
    TInterceptedRequestDTO,
    TStore,
    TMock,
    TNetworkEvent,
    TInterceptedResponseDTO,
} from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';
import { getValidMocks } from '../utils/getValidMocks';
import { getValidHeaders } from '../utils/getValidHeaders';
import { getStore, initStore } from '../utils/storage';
import { createStack, showAlert } from '../services/alert';
import { logError, logWarn } from '../utils/logger';

const logNetwork = async (store: TStore, event: TNetworkEvent) => {
    await chrome.storage.local.set({
        [STORE_KEY]: {
            ...store,
            network: [...(store.network ?? []), event],
        },
    });
};

const logInterceptedRequest = async (store: TStore, message: TInterceptedRequestDTO, mock: TMock) => {
    if (store.settings.showNotifications) {
        showAlert(message.url);
    }

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
};

const getMock = (store: TStore, message: TInterceptedRequestDTO): TMock | null => {
    const { origin } = window.location;

    if (!store?.mocks) {
        return null;
    }

    const mocks = getValidMocks({
        mocks: store.mocks,
        url: message.url,
        method: message.method,
        origin,
    });

    if (mocks.length === 0) {
        return null;
    }

    return mocks[0];
};

listenMessage<TInterceptedRequestDTO>('requestIntercepted', async (message) => {
    try {
        const store = await getStore();

        const headers = getValidHeaders({
            headerProfiles: store.headersProfiles,
            origin: window.location.origin,
            url: message.url,
            method: message.method,
            type: 'request',
        });

        const mock = getMock(store, message);

        sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
            messageId: message.messageId,
            headers,
            mock,
        });

        if (mock) {
            await logInterceptedRequest(store, message, mock);
        }
    } catch (err) {
        logError(err);
        sendMessage<TInterceptedRequestMockDTO>('requestChecked', {
            messageId: message.messageId,
            headers: {},
        });
    }
});

listenMessage<TInterceptedResponseDTO>('responseIntercepted', async (message) => {
    try {
        const store = await getStore();
        await logNetwork(store, message.event);
    } catch (err) {
        logError(err);
    }
});

const destroy = () => {
    const script = document.getElementById(INTERCEPTOR_ID);
    script?.parentNode?.removeChild(script);
};

export const main = async () => {
    destroy();

    await initStore();

    // Inject mockiato script to user's DOM
    const s = document.createElement('script');
    s.id = INTERCEPTOR_ID;
    s.src = chrome.runtime.getURL('mockiato.js');
    s.onload = () => {
        // eslint-disable-next-line max-len
        logWarn('The Mockiato extension has created a request interceptor! Now all requests are proxies through it to implement mocks.');
    };

    (document.head || document.documentElement).appendChild(s);
};

document.addEventListener('DOMContentLoaded', () => {
    // Add div for alerts when dom is ready
    createStack();
});

main();
