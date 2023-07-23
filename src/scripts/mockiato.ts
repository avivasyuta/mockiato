import { nanoid } from 'nanoid';
import { BatchInterceptor } from '@mswjs/interceptors';
import { FetchInterceptor } from '@mswjs/interceptors/fetch';
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest';
import { TInterceptedRequestDTO, TInterceptedRequestMockDTO } from '../types';
import { sendMessage, listenMessage } from '../services/message';
import { MessageBus } from '../services/messageBus';
import { showAlert } from '../services/alert';
import { logError, logWarn } from '../utils/logger';
import { delay } from '../utils/delay';

const messageBus = new MessageBus();
const interceptor = new BatchInterceptor({
    name: 'mockiatoInterceptor',
    interceptors: [
        new FetchInterceptor(),
        new XMLHttpRequestInterceptor(),
    ],
});

interceptor.apply();

// eslint-disable-next-line max-len
logWarn('The Mockiato extension has created a request interceptor! Now all requests are proxies through it to implement mocks.');

const getRequestMocks = (url: string, method: string): Promise<TInterceptedRequestMockDTO> => {
    const messageId = nanoid();

    const message: TInterceptedRequestDTO = {
        messageId,
        url,
        method,
    };

    sendMessage<TInterceptedRequestDTO>('requestIntercepted', message);

    return new Promise((resolve) => {
        messageBus.addListener(messageId, resolve);
    });
};

interceptor.on('request', async ({ request }) => {
    try {
        const { mock, headers } = await getRequestMocks(request.url, request.method);

        // Add headers to request
        Object.entries(headers).forEach(([key, value]) => {
            request.headers.set(key, value);
        });

        // If there is no mock return from interceptor and send original request with additional headers (if exists)
        if (!mock) {
            return;
        }

        // Convert response headers from mock
        const responseHeaders = mock.responseHeaders.reduce<Record<string, string>>((acc, header) => ({
            ...acc,
            [header.key]: header.value,
        }), {});

        const response = new Response(
            mock.response,
            {
                status: mock.httpStatusCode,
                headers: responseHeaders,
            },
        );

        if (mock.delay) {
            await delay(mock.delay);
        }

        request.respondWith(response);
        showAlert(request.url);
    } catch (err) {
        logError(err);
    }
});

listenMessage<TInterceptedRequestMockDTO>('requestChecked', (message) => {
    messageBus.dispatch(message.messageId, message);
});

export {};
