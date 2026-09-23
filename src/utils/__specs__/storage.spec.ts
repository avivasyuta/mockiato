import { beforeEach, describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { HttpMethodType, TMock, TMockGroup } from '~/types';
import { delay } from '~/utils/delay';
import { addMockHits, appendLog, appendNetworkEvent, getStore, setStoreValue } from '~/utils/storage';

const mockGroup: TMockGroup = {
  id: 'group_1',
  name: 'Imported group',
};

const mockMock: TMock = {
  id: 'mock_1',
  url: 'url',
  urlType: 'url',
  httpMethod: HttpMethodType.GET,
  httpStatusCode: 200,
  delay: 0,
  responseType: 'json',
  responseHeaders: [],
  isActive: true,
  groupId: 'group_1',
};

describe('storage', () => {
  beforeEach(() => {
    setupChromeStorageMock({}, { delayMs: 10 });
  });

  test('concurrent unawaited writes to different keys both survive', async () => {
    setStoreValue('mockGroups', [mockGroup]);
    setStoreValue('mocks', [mockMock]);

    await delay(100);

    const store = await getStore();

    expect(store.mockGroups).toEqual([mockGroup]);
    expect(store.mocks).toEqual([mockMock]);
  });

  test('sequential awaited writes preserve both mocks and groups', async () => {
    await setStoreValue('mockGroups', [mockGroup]);
    await setStoreValue('mocks', [mockMock]);

    const store = await getStore();

    expect(store.mockGroups).toEqual([mockGroup]);
    expect(store.mocks).toEqual([mockMock]);
  });

  test('concurrent unawaited appendLog calls do not lose entries', async () => {
    const logs = Array.from({ length: 8 }, (_, i) => ({
      url: `/url-${i}`,
      method: 'GET',
      date: new Date().toISOString(),
      host: 'example.com',
      mock: mockMock,
    }));

    await Promise.all(logs.map((log) => appendLog(log)));

    const store = await getStore();
    expect(store.logs).toHaveLength(logs.length);
  });

  test('concurrent unawaited appendNetworkEvent calls do not lose entries', async () => {
    const events = Array.from({ length: 8 }, (_, i) => ({
      host: 'example.com',
      date: new Date().toISOString(),
      request: { url: `/url-${i}`, method: HttpMethodType.GET },
      response: { type: 'json' as const, headers: [], httpStatusCode: 200 },
    }));

    await Promise.all(events.map((event) => appendNetworkEvent(event)));

    const store = await getStore();
    expect(store.network).toHaveLength(events.length);
  });

  test('concurrent unawaited addMockHits calls do not lose hits', async () => {
    const hits = 15;

    await Promise.all(Array.from({ length: hits }, () => addMockHits(1)));

    const store = await getStore();
    expect(store.ratingPrompt.mockHits).toBe(hits);
  });
});
