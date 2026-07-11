import { describe, test, expect, beforeEach, vi } from 'vitest';
import { HttpMethodType, TMock, TMockGroup } from '~/types';
import { getStore, setStoreValue } from '~/utils/storage';

const delay = (ms: number) => new Promise((resolve) => {
    setTimeout(resolve, ms);
});

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

// Simulates real chrome.storage.local latency: get/set don't resolve instantly,
// so overlapping read-modify-write cycles can interleave and clobber each other.
const setupChromeStorageMock = () => {
    let backingStore: Record<string, unknown> = {};

    (global as unknown as { chrome: unknown }).chrome = {
        storage: {
            local: {
                get: vi.fn(async (key: string) => {
                    await delay(10);
                    return { [key]: backingStore[key] };
                }),
                set: vi.fn(async (items: Record<string, unknown>) => {
                    await delay(10);
                    backingStore = { ...backingStore, ...items };
                }),
            },
        },
    };
};

describe('storage', () => {
    beforeEach(() => {
        setupChromeStorageMock();
    });

    test('concurrent unawaited writes can lose data', async () => {
        setStoreValue('mockGroups', [mockGroup]);
        setStoreValue('mocks', [mockMock]);

        await delay(50);

        const store = await getStore();

        expect(store.mockGroups).toEqual([]);
        expect(store.mocks).toEqual([mockMock]);
    });

    test('sequential awaited writes preserve both mocks and groups', async () => {
        await setStoreValue('mockGroups', [mockGroup]);
        await setStoreValue('mocks', [mockMock]);

        const store = await getStore();

        expect(store.mockGroups).toEqual([mockGroup]);
        expect(store.mocks).toEqual([mockMock]);
    });
});
