import * as xhook from 'xhook';
import { nanoid } from 'nanoid';
import { MessageBus } from './messageBus';
import { TRequest, TMock, TMockResponseDTO } from '../types';
import { sendMessage, listenMessage } from '../services/message';

type TXhookRequest = {
    url: string
    method: string
    body: string
    headers: Record<string, string>
}

type TXhookCallback = (response?: unknown) => void

const messageBus = new MessageBus();

listenMessage<TMockResponseDTO>('mockChecked', (response) => {
    if (!response) {
        // TODO понять, почему не приходят ответы периодически
        // eslint-disable-next-line no-console
        console.error('Couldn\'t get response of mock in extension');
    } else {
        messageBus.dispatch(response.messageId, response.mocks);
    }
});

const getUrl = (url: string): string => {
    const questionMarkIndex = url.indexOf('?');

    if (questionMarkIndex === -1) {
        return url;
    }

    return url.slice(0, questionMarkIndex);
};

const send = <T>(request: TXhookRequest): Promise<T> => {
    const messageId = nanoid();

    const message: TRequest = {
        messageId,
        url: getUrl(request.url),
        method: request.method,
        body: request.body,
    };

    sendMessage<TRequest>('intercepted', message);

    return new Promise<T>((resolve) => {
        messageBus.addListener(messageId, resolve);
    });
};

xhook.before(async (request: TXhookRequest, callback: TXhookCallback) => {
    const mocks = await send<TMock[]>(request);

    if (mocks.length === 0) {
        callback();
        return;
    }

    const mock = mocks[0];

    // eslint-disable-next-line no-console
    console.warn(`Mockiato intercepted request ${request.url} and replaced it with mock\n`, mock);

    const response = {
        status: mock.httpStatusCode,
        text: mock.response,
        type: mock.responseType,
    };

    if (mock.delay) {
        setTimeout(() => {
            callback(response);
        }, mock.delay);
    } else {
        callback(response);
    }
});

export {};
