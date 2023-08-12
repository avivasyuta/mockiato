import { nanoid } from 'nanoid';
import { BatchInterceptor } from '@mswjs/interceptors';
import { FetchInterceptor } from '@mswjs/interceptors/fetch';
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest';
import {
    HttpMethodType,
    TInterceptedRequestDTO,
    TInterceptedRequestMockDTO,
    TInterceptedResponseDTO, TMockHeader, TResponseType,
} from '../types';
import { sendMessage, listenMessage } from '../services/message';
import { MessageBus } from '../services/messageBus';
import { logError } from '../utils/logger';
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
    } catch (err) {
        logError(err);
    }
});

interceptor.on('response', async ({ request, response }) => {
    const headers: TMockHeader[] = [];
    const res = response.clone();

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of res.headers.entries()) {
        headers.push({
            id: nanoid(),
            key,
            value,
        });
    }

    const body = await res.text();
    let type: TResponseType;

    try {
        JSON.parse(body);
        type = 'json';
    } catch (_) {
        type = 'text';
    }

    const message: TInterceptedResponseDTO = {
        event: {
            date: new Date().toISOString(),
            host: window.location.hostname,
            request: {
                url: request.url,
                method: request.method as HttpMethodType,
            },
            response: {
                body,
                type,
                headers,
                httpStatusCode: response.status,
            },
        },
    };

    sendMessage<TInterceptedResponseDTO>('responseIntercepted', message);
});

listenMessage<TInterceptedRequestMockDTO>('requestChecked', (message) => {
    messageBus.dispatch(message.messageId, message);
});

export {};
