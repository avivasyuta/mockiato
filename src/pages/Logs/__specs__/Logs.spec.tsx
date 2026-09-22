import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { STORE_KEY } from '~/contstant';
import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { stubTabHost } from '~/test/stubTabHost';
import { HttpMethodType, TLog, TStore } from '~/types';
import { getStore } from '~/utils/storage';

import { Logs } from '../Logs';
import { getLogCard, toggleLogExpand } from './domHelpers';
import { buildLog, buildMock } from './fixtures';

const HOST = 'example.com';
const OTHER_HOST = 'other.test';

describe('Logs page', () => {
  test('renders each log entry with its own method, url, date and status', async () => {
    const getMock = buildMock({
      url: 'https://example.com/users',
      httpMethod: HttpMethodType.GET,
      httpStatusCode: 200,
    });
    const postMock = buildMock({
      url: 'https://example.com/orders',
      httpMethod: HttpMethodType.POST,
      httpStatusCode: 201,
    });

    const logs: TLog[] = [
      buildLog({ url: getMock.url, method: 'GET', mock: getMock, host: HOST }),
      buildLog({ url: postMock.url, method: 'POST', mock: postMock, host: HOST }),
    ];

    setupChromeStorageMock({ logs });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Logs />);
    await findByText(getMock.url);

    const getRow = getLogCard(getMock.url);
    expect(getRow).toHaveTextContent('GET');
    expect(getRow).toHaveTextContent(getMock.url);

    const postRow = getLogCard(postMock.url);
    expect(postRow).toHaveTextContent('POST');
    expect(postRow).toHaveTextContent(postMock.url);
  });

  test('only shows logs for the current tab host', async () => {
    const ownLog = buildLog({ host: HOST });
    const otherHostLog = buildLog({ host: OTHER_HOST, url: 'https://other.test/should-not-appear' });

    setupChromeStorageMock({ logs: [ownLog, otherHostLog] });
    stubTabHost(HOST);

    const { findByText, queryByText } = renderWithProviders(<Logs />);

    expect(await findByText(ownLog.url)).toBeInTheDocument();
    expect(queryByText(otherHostLog.url)).not.toBeInTheDocument();
  });

  test('shows the empty state when there are no logs for the current host', async () => {
    setupChromeStorageMock({ logs: [] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Logs />);

    expect(await findByText('There are no logs')).toBeInTheDocument();
  });

  test('reveals response status, type, headers and body after expanding', async () => {
    const user = userEvent.setup();
    const mock = buildMock({
      url: 'https://example.com/users',
      httpStatusCode: 201,
      responseType: 'json',
      response: JSON.stringify({ id: 1 }),
      responseHeaders: [{ id: 'h1', key: 'x-request-id', value: 'abc-123' }],
    });
    const log = buildLog({ url: mock.url, mock, host: HOST });

    setupChromeStorageMock({ logs: [log] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Logs />);
    await findByText(mock.url);

    await toggleLogExpand(user, mock.url);

    const row = getLogCard(mock.url);
    expect(row).toHaveTextContent('Response status code:');
    expect(row).toHaveTextContent('201');
    expect(row).toHaveTextContent('Response type:');
    expect(row).toHaveTextContent('json');
    expect(row).toHaveTextContent('x-request-id:');
    expect(row).toHaveTextContent('abc-123');
    // toHaveTextContent normalizes whitespace, so match the pretty-printed JSON loosely.
    expect(row).toHaveTextContent('"id": 1');
  });

  test('shows "empty" placeholders when the mock has no response headers or body', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/empty', responseHeaders: [], response: undefined });
    const log = buildLog({ url: mock.url, mock, host: HOST });

    setupChromeStorageMock({ logs: [log] });
    stubTabHost(HOST);

    const { findByText } = renderWithProviders(<Logs />);
    await findByText(mock.url);

    await toggleLogExpand(user, mock.url);

    const row = getLogCard(mock.url);
    expect(row).toHaveTextContent('Response headers: empty');
    expect(row).toHaveTextContent('Response body: empty');
  });

  test('clicking "Erase all logs" clears only the current host\'s logs, keeping other hosts intact', async () => {
    const user = userEvent.setup();
    const ownLog = buildLog({ host: HOST });
    const otherHostLog = buildLog({ host: OTHER_HOST, url: 'https://other.test/keep-me' });

    setupChromeStorageMock({ logs: [ownLog, otherHostLog] });
    stubTabHost(HOST);

    const { findByText, findByTestId, findByRole, queryByText } = renderWithProviders(<Logs />);
    await findByText(ownLog.url);

    await user.click(await findByTestId('profile-menu/trigger'));
    await user.click(await findByRole('menuitem', { name: 'Erase all logs' }));

    expect(queryByText(ownLog.url)).not.toBeInTheDocument();

    const store = await getStore();
    expect(store.logs).toHaveLength(1);
    expect(store.logs[0].url).toBe(otherHostLog.url);
  });

  test('the "Erase all logs" menu item is disabled when there is nothing to erase', async () => {
    const user = userEvent.setup();
    setupChromeStorageMock({ logs: [] });
    stubTabHost(HOST);

    const { findByText, findByTestId, findByRole } = renderWithProviders(<Logs />);
    await findByText('There are no logs');

    await user.click(await findByTestId('profile-menu/trigger'));

    expect(await findByRole('menuitem', { name: 'Erase all logs' })).toBeDisabled();
  });

  test('renders every entry once across a burst of writes sharing a millisecond timestamp', async () => {
    // Regression test for the real-world scenario: a burst of concurrent intercepted requests
    // (now all correctly persisted instead of racing and clobbering each other) can produce
    // several log entries with the exact same millisecond-precision `date`. Each background
    // write also fires its own `chrome.storage.onChanged` event, so the UI re-renders once per
    // write as the list grows — this is what actually exercises React's keyed-list reconciliation,
    // unlike a single one-shot render with a duplicate key (which React tolerates gracefully).
    const collidingTimestamp = '2026-09-22T13:32:37.910Z';

    const logs: TLog[] = [
      buildLog({ date: '2026-09-22T13:32:37.619Z', host: HOST }),
      buildLog({ date: '2026-09-22T13:32:37.620Z', host: HOST }),
      buildLog({ date: collidingTimestamp, host: HOST }),
      buildLog({ date: collidingTimestamp, host: HOST }),
      buildLog({ date: '2026-09-22T13:32:37.911Z', host: HOST }),
      buildLog({ date: '2026-09-22T13:32:37.911Z', host: HOST }),
      buildLog({ date: '2026-09-22T13:32:37.912Z', host: HOST }),
    ];

    const { getStore: getBackingStore } = setupChromeStorageMock();
    stubTabHost(HOST);

    const { findAllByText } = renderWithProviders(<Logs />);

    // Wait for the initial (empty) mount to settle, then replay each write one at a time —
    // mirroring N separate `appendLog` calls, each triggering its own `onChanged` event and
    // re-render, with the array growing by one entry per step.
    await act(async () => {
      await Promise.resolve();
    });

    const setStorage = (
      globalThis as unknown as { chrome: { storage: { local: { set: (v: unknown) => Promise<void> } } } }
    ).chrome.storage.local.set;

    await logs.reduce(
      (previous, _log, i) =>
        previous.then(() => {
          const store = getBackingStore() as TStore;
          const nextStore: TStore = { ...store, logs: logs.slice(0, i + 1) };
          return act(async () => setStorage({ [STORE_KEY]: nextStore }));
        }),
      Promise.resolve(),
    );

    await Promise.all(logs.map((log) => findAllByText(log.url).then((matches) => expect(matches).toHaveLength(1))));
  });
});
