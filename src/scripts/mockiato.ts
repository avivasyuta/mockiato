import { nanoid } from 'nanoid';
import { BatchInterceptor } from '@mswjs/interceptors';
import { FetchInterceptor } from '@mswjs/interceptors/fetch';
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest';
import {
    TInterceptedRequestDTO,
    TInterceptedRequestMockDTO,
} from '../types';
import { sendMessage, listenMessage } from '../services/message';
import { MessageBus } from '../services/messageBus';
import { showAlert, createStack } from '../services/alert';

const interceptor = new BatchInterceptor({
    name: 'mockiatoInterceptor',
    interceptors: [
        new FetchInterceptor(),
        new XMLHttpRequestInterceptor(),
    ],
});

interceptor.apply();

// TODO почему в тестов приложении срабатывает после отправки запроса?
console.warn('The Mockiato extension has created a request interceptor! Now all requests are proxied through it to implement mocks.');

const messageBus = new MessageBus();

listenMessage<TInterceptedRequestMockDTO>('requestChecked', (message) => {
    messageBus.dispatch(message.messageId, message);
});

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
    let data: TInterceptedRequestMockDTO;

    try {
        data = await getRequestMocks(request.url, request.method);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return;
    }

    const { mock, headers } = data;

    // Add headers to request
    Object.entries(headers).forEach(([key, value]) => {
        request.headers.set(key, value);
    });

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
            // TODO
            statusText: 'My custom status text',
            headers: responseHeaders,
        },
    );

    // TODO проверить таймауты
    if (mock.delay) {
        setTimeout(() => {
            request.respondWith(response);
            showAlert(request.url);
        }, mock.delay);
    } else {
        request.respondWith(response);
        showAlert(request.url);
    }
});

createStack();

export {};
