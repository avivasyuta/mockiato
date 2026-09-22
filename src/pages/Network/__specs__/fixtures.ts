import { HttpMethodType, TNetworkEvent } from '~/types';

let counter = 0;

export const buildNetworkEvent = (overrides: Partial<TNetworkEvent> = {}): TNetworkEvent => {
  counter += 1;

  return {
    id: `network-${counter}`,
    host: 'example.com',
    date: new Date(2026, 0, 1, 0, 0, 0, counter).toISOString(),
    request: {
      url: `https://example.com/api/${counter}`,
      method: HttpMethodType.GET,
    },
    response: {
      type: 'json',
      headers: [],
      httpStatusCode: 200,
      body: JSON.stringify({ ok: true }),
    },
    ...overrides,
  };
};
