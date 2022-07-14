import { EXTENSION_NAME } from '../contstant';
import { MessageType } from '../types';

export const sendMessage = <T>(type: MessageType, message: T): void => {
    window.postMessage(
        {
            message,
            type,
            extensionName: EXTENSION_NAME
        },
        "*"
    )
}

export const listenMessage = <T>(messageType: MessageType, callback: (payload: T) => void): void => {
    window.addEventListener("message", (event) => {
        const { data, source } = event;

        if (source !== window || typeof data !== 'object') return;
        if (data.type !== messageType || data.extensionName !== EXTENSION_NAME) return;

        callback(data.message);
    });
}
