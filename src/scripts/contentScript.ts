import { listenMessage, sendMessage } from '../services/message';
import { TMockResponseDTO, TRequest } from '../types';

listenMessage<TRequest>('intercepted', async (request) => {
    // send message with intercepted request to extension
    // eslint-disable-next-line no-undef
    chrome.runtime.sendMessage(request, (response: TMockResponseDTO) => {
        sendMessage<TMockResponseDTO>('mockChecked', response);
    });
});

// Inject Script to user's DOM
export const injectScript = () => {
    const s = document.createElement('script');
    // eslint-disable-next-line no-undef
    s.src = chrome.runtime.getURL('injectInterceptor.js');
    (document.head || document.documentElement).appendChild(s);
};

injectScript();
