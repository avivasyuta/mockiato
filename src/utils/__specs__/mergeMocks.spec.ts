import { describe, expect, test } from 'vitest';
import { mergeMocks } from '~/utils/mergeMocks';
import { HttpMethodType, TMock } from '~/types';

type TestSuit = {
    name: string;
    oldMocks: TMock[];
    newMocks: TMock[];
    expectedMocks: TMock[];
};

const testTable: TestSuit[] = [
    {
        name: 'Unique mock ids',
        oldMocks: [
            {
                id: 'id_1',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
        newMocks: [
            {
                id: 'id_2',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
        expectedMocks: [
            {
                id: 'id_1',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
            {
                id: 'id_2',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
    },
    {
        name: 'Mocks with same id and different data',
        oldMocks: [
            {
                id: 'id_1',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
        newMocks: [
            {
                id: 'id_1',
                url: 'url2',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
        expectedMocks: [
            {
                id: 'id_1',
                url: 'url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 200,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
            },
        ],
    },
];

describe('mergeMocks', () => {
    testTable.forEach((testCase) => {
        test(testCase.name, () => {
            const result = mergeMocks(testCase.oldMocks, testCase.newMocks);
            expect(result).toEqual(testCase.expectedMocks);
        });
    });
});
