import { nanoid } from 'nanoid';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xhook from '../xhook';
import {
    TRequest,
    TMock,
    TXhookRequest,
    TInterceptedRequestDTO,
} from '../types';
import { sendMessage, listenMessage } from '../services/message';
import { MessageBus } from '../services/messageBus';
import { showAlert, createStack } from '../services/alert';

type TXhookCallback = (response?: unknown) => void

const messageBus = new MessageBus();

listenMessage<TInterceptedRequestDTO>('requestChecked', (response) => {
    messageBus.dispatch(response.messageId, response);
});

const getRequestMocks = (request: TXhookRequest): Promise<unknown> => {
    const messageId = nanoid();

    const message: TRequest = {
        messageId,
        url: request.url,
        method: request.method,
    };

    sendMessage<TRequest>('intercepted', message);

    return new Promise((resolve) => {
        messageBus.addListener(messageId, resolve);
    });
};

xhook.before(async (request: TXhookRequest, callback: TXhookCallback) => {
    let data: {
        headers: Record<string, string>
        mock?: TMock
    };

    try {
        data = await getRequestMocks(request);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        callback();
        return;
    }

    if (!mock) {
        callback();
        return;
    }

    const response = {
        status: mock.httpStatusCode,
        text: mock.response,
        type: mock.responseType,
    };

    if (mock.delay) {
        setTimeout(() => {
            callback(response);
            showAlert(request);
        }, mock.delay);
    } else {
        callback(response);
        showAlert(request);
    }
});

createStack();

export {};
