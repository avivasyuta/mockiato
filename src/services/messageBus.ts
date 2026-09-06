type Callback<T> = (value: T) => void;

export class MessageBus<T = unknown> {
  private readonly collector: Record<string, Callback<T>>;

  constructor() {
    this.collector = {};
  }

  addListener(messageId: string, callback: Callback<T>): void {
    this.collector[messageId] = callback;
  }

  dispatch(messageId: string, payload: T): void {
    const callback = this.collector[messageId];

    if (!callback) {
      return;
    }

    callback(payload);
  }
}
