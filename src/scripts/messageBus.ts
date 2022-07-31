import { TMock } from '../types';

// TODO remove any type
export class MessageBus {
    private readonly collector: Record<string, any>;

    constructor() {
        this.collector = {};
    }

    addListener(messageId: string, callback: any) {
        this.collector[messageId] = callback;
    }

    dispatch(messageId: string, payload: TMock[]) {
        const callback = this.collector[messageId];

        if (!callback) {
            return;
        }

        callback(payload);
    }
}
