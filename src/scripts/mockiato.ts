import { nanoid } from 'nanoid';
import { BatchInterceptor } from '@mswjs/interceptors';
import { FetchInterceptor } from '@mswjs/interceptors/fetch';
import { XMLHttpRequestInterceptor } from '@mswjs/interceptors/XMLHttpRequest';
import {
    HttpMethodType,
    TInterceptedRequestDTO,
    TInterceptedRequestMockDTO,
    TInterceptedResponseDTO,
    TMockHeader,
    TResponseType,
    TStoreSettings,
} from '~/types';
import { listenMessage, sendMessage } from '~/services/message';
import { MessageBus } from '~/services/messageBus';
import { logError, logWarn } from '~/utils/logger';
import { delay } from '~/utils/delay';
import { isExtensionEnabled } from '~/utils/isExtensionEnabled';
import { enabledAttributeName, INTERCEPTOR_ID, statusNodeId } from '~/contstant';

const messageBus = new MessageBus();
const interceptor = new BatchInterceptor({
    name: 'mockiatoInterceptor',
    interceptors: [new FetchInterceptor(), new XMLHttpRequestInterceptor()],
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

const addInterceptorHandlers = () => {
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
            const responseHeaders = mock.responseHeaders.reduce<Record<string, string>>(
                (acc, header) => ({
                    ...acc,
                    [header.key]: header.value,
                }),
                {},
            );

            const response = new Response(mock.response, {
                status: mock.httpStatusCode,
                headers: responseHeaders,
            });

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

        res.headers.forEach((value, key) => {
            headers.push({
                id: nanoid(),
                key,
                value,
            });
        });

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
                host: window.location.host,
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
};

const enableInterceptor = () => {
    interceptor.apply();
    addInterceptorHandlers();
    logWarn(
        'The Mockiato extension has created a request interceptor! ' +
            'Now all requests are proxies through it to implement mocks.',
    );
};

const disableInterceptor = () => {
    interceptor.dispose();
    logWarn('The Mockiato extension has removed request interceptor!');
};

const isCurrentExtensionEnabled = (): boolean => {
    const scriptElement = document.getElementById(INTERCEPTOR_ID);
    if (!scriptElement) {
        return false;
    }
    const enabledParam = scriptElement.getAttribute(enabledAttributeName);
    return enabledParam !== null && enabledParam === 'true';
};

const setCurrentExtensionEnabledStatus = (status: boolean) => {
    const scriptElement = document.getElementById(INTERCEPTOR_ID);
    if (!scriptElement) {
        return;
    }
    scriptElement.setAttribute(enabledAttributeName, String(status));
};

const run = () => {
    const isEnabled = isCurrentExtensionEnabled();
    if (isEnabled) {
        // First script load
        enableInterceptor();
    }
};

run();

listenMessage<TInterceptedRequestMockDTO>('requestChecked', (message) => {
    messageBus.dispatch(message.messageId, message);
});

// Fires on change extension settings
listenMessage<TStoreSettings>('settingsChanged', (settings) => {
    const isSettingEnabled = isExtensionEnabled(settings);
    const isAlreadyEnabled = isCurrentExtensionEnabled();

    const statusNode = document.getElementById(statusNodeId);
    if (!statusNode) {
        return;
    }

    if (isSettingEnabled && !isAlreadyEnabled) {
        enableInterceptor();
        setCurrentExtensionEnabledStatus(true);
    } else {
        disableInterceptor();
        setCurrentExtensionEnabledStatus(false);
    }

    statusNode.style.opacity = isSettingEnabled && settings.showActiveStatus ? '1' : '0';
});
