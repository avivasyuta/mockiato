import { describe, expect, test } from 'vitest';

import { HttpMethodType, TStore } from '~/types';
import { emptyStore, mergeStoreWithDefaults } from '~/utils/storeCore';

const mock = {
  id: 'mock_1',
  url: '/some-url',
  urlType: 'url' as const,
  httpMethod: HttpMethodType.GET,
  httpStatusCode: 200,
  delay: 0,
  responseType: 'json' as const,
  responseHeaders: [],
  isActive: true,
};

type TestSuit = {
  name: string;
  existing: TStore | undefined;
  expected: TStore;
};

const testTable: TestSuit[] = [
  {
    name: 'no existing store falls back to the default store',
    existing: undefined,
    expected: emptyStore,
  },
  {
    name: 'array-shaped keys (mocks, mockGroups, logs) are replaced wholesale',
    existing: {
      ...emptyStore,
      mocks: [mock],
      mockGroups: [{ id: 'group_1', name: 'Group' }],
      logs: [{ url: '/some-url', method: 'GET', date: '2026-01-01T00:00:00.000Z', host: 'example.com', mock }],
    },
    expected: {
      ...emptyStore,
      mocks: [mock],
      mockGroups: [{ id: 'group_1', name: 'Group' }],
      logs: [{ url: '/some-url', method: 'GET', date: '2026-01-01T00:00:00.000Z', host: 'example.com', mock }],
    },
  },
  {
    name: 'network is always reset to empty, even if the existing store has entries',
    existing: {
      ...emptyStore,
      network: [
        {
          host: 'example.com',
          date: '2026-01-01T00:00:00.000Z',
          request: { url: '/some-url', method: HttpMethodType.GET },
          response: { type: 'json', headers: [], httpStatusCode: 200 },
        },
      ],
    },
    expected: emptyStore,
  },
  {
    name: 'object-shaped keys (settings) shallow-merge onto the defaults, preserving existing values',
    existing: {
      ...emptyStore,
      settings: {
        ...emptyStore.settings,
        showNotifications: false,
        enabledHosts: { 'example.com': true },
      },
    },
    expected: {
      ...emptyStore,
      settings: {
        ...emptyStore.settings,
        showNotifications: false,
        enabledHosts: { 'example.com': true },
      },
    },
  },
  {
    name: 'object-shaped keys (headersProfiles) shallow-merge, keeping existing profiles',
    existing: {
      ...emptyStore,
      headersProfiles: {
        profile_1: { id: 'profile_1', name: 'Profile', status: 'enabled', lastActive: true, headers: [] },
      },
    },
    expected: {
      ...emptyStore,
      headersProfiles: {
        profile_1: { id: 'profile_1', name: 'Profile', status: 'enabled', lastActive: true, headers: [] },
      },
    },
  },
];

describe('mergeStoreWithDefaults', () => {
  testTable.forEach((testCase) => {
    test(testCase.name, () => {
      expect(mergeStoreWithDefaults(testCase.existing)).toEqual(testCase.expected);
    });
  });

  test('does not mutate the passed-in existing store', () => {
    const existing: TStore = { ...emptyStore, mocks: [mock] };
    const existingSnapshot = structuredClone(existing);

    mergeStoreWithDefaults(existing);

    expect(existing).toEqual(existingSnapshot);
  });
});
