import { listenMessage, sendMessage } from '~/services/message';
import { createStack, showAlert } from '~/services/alert';
import {
    TInterceptedRequestDTO,
    TInterceptedRequestMockDTO,
    TInterceptedResponseDTO,
    TLog,
    TMock,
    TNetworkEvent,
    TStore,
} from '~/types';
import { INTERCEPTOR_ID, STORE_KEY } from '~/contstant';
import { getValidMocks } from '~/utils/getValidMocks';
import { getValidHeaders } from '~/utils/getValidHeaders';
import { getStore, initStore } from '~/utils/storage';
import { logError, logWarn } from '~/utils/logger';
import { createStatus } from '~/services/status';
import { isExtensionEnabled } from '~/utils/isExtensionEnabled';

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

    const store = await initStore();

    const isEnabled = isExtensionEnabled(store.settings);

    // Inject mockiato script to user's DOM
    const s = document.createElement('script');
    s.type = 'module';
    s.id = INTERCEPTOR_ID;
    s.src = chrome.runtime.getURL('mockiato.js');
    s.onload = () => {
        logWarn(
            // eslint-disable-next-line max-len
            'The Mockiato extension has created a request interceptor! Now all requests are proxies through it to implement mocks.',
        );
    };

    if (isEnabled) {
        s.setAttribute('data-is-enabled', 'true');
    }

    (document.head || document.documentElement).appendChild(s);
};

const addActiveStatus = async () => {
    const store = await getStore();
    const isEnabled = isExtensionEnabled(store.settings);

    if (store.settings.showActiveStatus) {
        createStatus(isEnabled);
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Add div for alerts when dom is ready
    createStack();
    await addActiveStatus();
});

main();

chrome.storage.onChanged.addListener((changes) => {
    Object.entries(changes).forEach(([key, change]) => {
        if (key === STORE_KEY) {
            sendMessage<TStore>('settingsChanged', change.newValue as TStore);
        }
    });
});
