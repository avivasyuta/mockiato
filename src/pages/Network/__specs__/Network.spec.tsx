import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { stubTabHost } from '~/test/stubTabHost';
import { HttpMethodType } from '~/types';
import { getStore } from '~/utils/storage';

import { Network } from '../Network';
import { createMockFromNetworkEvent, getNetworkCard, toggleNetworkExpand } from './domHelpers';
import { buildNetworkEvent } from './fixtures';

const HOST = 'example.com';
const OTHER_HOST = 'other.test';

describe('Network page', () => {
  test('logs every request, across different HTTP methods, none lost', async () => {
    const methods = [
      HttpMethodType.GET,
      HttpMethodType.POST,
      HttpMethodType.PUT,
      HttpMethodType.DELETE,
      HttpMethodType.PATCH,
    ];

    const events = methods.map((method, i) =>
      buildNetworkEvent({
        host: HOST,
        request: { url: `https://example.com/api/item-${i}`, method },
      }),
    );

    setupChromeStorageMock({ network: events });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);
    await findByText(events[0].request.url);

    events.forEach((event) => {
      const row = getNetworkCard(event.request.url);
      expect(row).toHaveTextContent(event.request.method);
    });
  });

  test('only shows events for the current tab host', async () => {
    const ownEvent = buildNetworkEvent({ host: HOST });
    const otherHostEvent = buildNetworkEvent({
      host: OTHER_HOST,
      request: { url: 'https://other.test/should-not-appear', method: HttpMethodType.GET },
    });

    setupChromeStorageMock({ network: [ownEvent, otherHostEvent] });
    stubTabHost(HOST);

    const { findByText, queryByText } = renderWithProviders(<Network />);

    expect(await findByText(ownEvent.request.url)).toBeInTheDocument();
    expect(queryByText(otherHostEvent.request.url)).not.toBeInTheDocument();
  });

  test('shows the empty state when there are no requests for the current host', async () => {
    setupChromeStorageMock({ network: [] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);

    expect(await findByText('There are no requsts')).toBeInTheDocument();
  });

  test('renders method, url and status code for each event', async () => {
    const event = buildNetworkEvent({
      host: HOST,
      request: { url: 'https://example.com/orders', method: HttpMethodType.POST },
      response: { type: 'json', headers: [], httpStatusCode: 201, body: '{}' },
    });

    setupChromeStorageMock({ network: [event] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);
    await findByText(event.request.url);

    const row = getNetworkCard(event.request.url);
    expect(row).toHaveTextContent('POST');
    expect(row).toHaveTextContent(event.request.url);
    expect(row).toHaveTextContent('201');
  });

  test('reveals response type, headers and body after expanding', async () => {
    const user = userEvent.setup();
    const event = buildNetworkEvent({
      host: HOST,
      request: { url: 'https://example.com/users', method: HttpMethodType.GET },
      response: {
        type: 'json',
        headers: [{ id: 'h1', key: 'x-request-id', value: 'abc-123' }],
        httpStatusCode: 200,
        body: JSON.stringify({ id: 1 }),
      },
    });

    setupChromeStorageMock({ network: [event] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);
    await findByText(event.request.url);

    await toggleNetworkExpand(user, event.request.url);

    const row = getNetworkCard(event.request.url);
    expect(row).toHaveTextContent('Response type:');
    expect(row).toHaveTextContent('json');
    expect(row).toHaveTextContent('x-request-id:');
    expect(row).toHaveTextContent('abc-123');
    expect(row).toHaveTextContent('Response body');
    // toHaveTextContent normalizes whitespace, so match the pretty-printed JSON loosely.
    expect(row).toHaveTextContent('"id": 1');
  });

  test('shows "empty" placeholders when the event has no response headers or body', async () => {
    const user = userEvent.setup();
    const event = buildNetworkEvent({
      host: HOST,
      request: { url: 'https://example.com/empty', method: HttpMethodType.GET },
      response: { type: 'none', headers: [], httpStatusCode: 204, body: undefined },
    });

    setupChromeStorageMock({ network: [event] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);
    await findByText(event.request.url);

    await toggleNetworkExpand(user, event.request.url);

    const row = getNetworkCard(event.request.url);
    expect(row).toHaveTextContent('Response headers: empty');
    expect(row).toHaveTextContent('Response body: empty');
  });

  test('creates a mock derived from the event and prepends it, keeping existing mocks', async () => {
    const user = userEvent.setup();
    const existingMock = {
      id: 'existing-mock',
      url: 'https://example.com/existing',
      urlType: 'url' as const,
      httpMethod: HttpMethodType.GET,
      httpStatusCode: 200,
      delay: 0,
      responseType: 'json' as const,
      responseHeaders: [],
      isActive: true,
    };

    const event = buildNetworkEvent({
      host: HOST,
      request: { url: 'https://example.com/orders/42', method: HttpMethodType.PUT },
      response: {
        type: 'json',
        headers: [{ id: 'h1', key: 'x-request-id', value: 'abc-123' }],
        httpStatusCode: 204,
        body: JSON.stringify({ updated: true }),
      },
    });

    setupChromeStorageMock({ network: [event], mocks: [existingMock] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Network />);
    await findByText(event.request.url);

    await createMockFromNetworkEvent(user, event.request.url);

    expect(await findByText('Mock was created. See new mock in Response Mocks tab.')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(2);
    expect(store.mocks[0]).toMatchObject({
      url: event.request.url,
      urlType: 'url',
      httpMethod: 'PUT',
      httpStatusCode: 204,
      response: JSON.stringify({ updated: true }),
      responseType: 'json',
      responseHeaders: [expect.objectContaining({ key: 'x-request-id', value: 'abc-123' })],
      isActive: true,
    });
    // The pre-existing mock is kept, not overwritten.
    expect(store.mocks[1]).toMatchObject({ id: 'existing-mock' });
  });
});
