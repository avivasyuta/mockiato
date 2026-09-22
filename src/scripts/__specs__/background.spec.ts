import { beforeEach, describe, expect, test, vi } from 'vitest';

import { HttpMethodType, TLog, TMock, TMockGroup, TNetworkEvent } from '~/types';
import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { delay } from '~/utils/delay';
import { readStoreFromChromeStorage } from '~/utils/storeCore';

import { handleStoreMessage } from '../background';

const buildMock = (id: string): TMock => ({
  id,
  url: `/url-${id}`,
  urlType: 'url',
  httpMethod: HttpMethodType.GET,
  httpStatusCode: 200,
  delay: 0,
  responseType: 'json',
  responseHeaders: [],
  isActive: true,
});

const buildLog = (id: string): TLog => ({
  url: `/url-${id}`,
  method: 'GET',
  date: new Date().toISOString(),
  host: 'example.com',
  mock: buildMock(id),
});

const buildNetworkEvent = (id: string): TNetworkEvent => ({
  host: 'example.com',
  date: new Date().toISOString(),
  request: { url: `/url-${id}`, method: HttpMethodType.GET },
  response: { type: 'json', headers: [], httpStatusCode: 200, body: id },
});

describe('background / handleStoreMessage', () => {
  beforeEach(() => {
    setupChromeStorageMock({}, { delayMs: 10 });
  });

  test('N concurrent unawaited appendLog messages all survive', async () => {
    const logs = Array.from({ length: 10 }, (_, i) => buildLog(String(i)));

    await Promise.all(logs.map((log) => handleStoreMessage({ type: 'store/appendLog', log })));

    const response = await handleStoreMessage({ type: 'store/init' });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.store?.logs).toHaveLength(logs.length);
      expect(new Set(response.store?.logs.map((log) => log.url))).toEqual(new Set(logs.map((log) => log.url)));
    }
  });

  test('N concurrent unawaited appendNetworkEvent messages all survive', async () => {
    const events = Array.from({ length: 10 }, (_, i) => buildNetworkEvent(String(i)));

    await Promise.all(events.map((event) => handleStoreMessage({ type: 'store/appendNetworkEvent', event })));

    // Read the raw persisted store directly, not via `store/init` — `init` intentionally
    // resets `network` to `[]` on every call (see `mergeStoreWithDefaults`), so it can't be
    // used to verify network events survived.
    const store = await readStoreFromChromeStorage();
    expect(store.network).toHaveLength(events.length);
  });

  test('concurrent unawaited setValue writes to different keys do not clobber each other', async () => {
    const mockGroup: TMockGroup = { id: 'group_1', name: 'Imported group' };
    const mockMock = buildMock('mock_1');

    await Promise.all([
      handleStoreMessage({ type: 'store/setValue', key: 'mockGroups', value: [mockGroup] }),
      handleStoreMessage({ type: 'store/setValue', key: 'mocks', value: [mockMock] }),
    ]);

    const response = await handleStoreMessage({ type: 'store/init' });
    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.store?.mockGroups).toEqual([mockGroup]);
      expect(response.store?.mocks).toEqual([mockMock]);
    }
  });

  test('store/init merges defaults over the existing store and persists the result', async () => {
    const mockMock = buildMock('mock_1');
    await handleStoreMessage({ type: 'store/setValue', key: 'mocks', value: [mockMock] });

    const response = await handleStoreMessage({ type: 'store/init' });

    expect(response.ok).toBe(true);
    if (response.ok) {
      expect(response.store?.mocks).toEqual([mockMock]);
      expect(response.store?.settings.showNotifications).toBe(true);
    }
  });

  test('a failing write resolves { ok: false } but does not break the queue for the next message', async () => {
    (global as unknown as { chrome: { storage: { local: { set: unknown } } } }).chrome.storage.local.set = vi
      .fn()
      .mockRejectedValueOnce(new Error('QUOTA_BYTES quota exceeded'))
      .mockImplementation(async (items: Record<string, unknown>) => {
        await delay(10);
        return items;
      });

    const failing = await handleStoreMessage({ type: 'store/setValue', key: 'mocks', value: [buildMock('1')] });
    expect(failing.ok).toBe(false);

    const next = await handleStoreMessage({ type: 'store/setValue', key: 'mocks', value: [buildMock('2')] });
    expect(next.ok).toBe(true);
  });
});
