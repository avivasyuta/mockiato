import { listenMessage, sendMessage } from '../services/message';
import { TLog, TMockResponseDTO, TRequest } from '../types';
import { INTERCEPTOR_ID, STORE_KEY } from '../contstant';
import { getStore } from './store';

listenMessage<TRequest>('intercepted', async (request) => {
    const store = await getStore();

    if (store?.mocks) {
        const mocks = store.mocks.filter((mock) => mock.isActive
            && request.url.startsWith(mock.url)
            && mock.httpMethod === request.method);

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
