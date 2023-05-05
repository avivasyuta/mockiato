import { TMock } from '../types';

type Callback = (value?: TMock) => void

export class MessageBus {
    private readonly collector: Record<string, Callback>;

    constructor() {
        this.collector = {};
    }

    addListener(messageId: string, callback: Callback): void {
        this.collector[messageId] = callback;
    }

    dispatch(messageId: string, payload?: TMock): void {
        const callback = this.collector[messageId];

        if (!callback) {
            return;
        }

        callback(payload);
    }
}
