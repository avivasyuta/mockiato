/* eslint-disable-next-line */
type Callback = (value?: any) => void

export class MessageBus {
    private readonly collector: Record<string, Callback>;

    constructor() {
        this.collector = {};
    }

    addListener(messageId: string, callback: Callback): void {
        this.collector[messageId] = callback;
    }

    /* eslint-disable-next-line */
    dispatch(messageId: string, payload?: any): void {
        const callback = this.collector[messageId];

        if (!callback) {
            return;
        }

        callback(payload);
    }
}
