import { describe, test, expect } from 'vitest';
import { mergeGroups } from '~/utils/mergeGroups';
import { TMockGroup } from '~/types';

type TestSuit = {
    name: string;
    oldGroups: TMockGroup[];
    newGroups: TMockGroup[];
    expectedGroups: TMockGroup[];
};

const testTable: TestSuit[] = [
    {
        name: 'Unique groups',
        oldGroups: [
            {
                id: 'id_1',
                name: 'Group 1',
            },
        ],
        newGroups: [
            {
                id: 'id_2',
                name: 'Group 2',
            },
        ],
        expectedGroups: [
            {
                id: 'id_1',
                name: 'Group 1',
            },
            {
                id: 'id_2',
                name: 'Group 2',
            },
        ],
    },
    {
        name: 'Groups with same id and different names',
        oldGroups: [
            {
                id: 'id_1',
                name: 'Group 1',
            },
        ],
        newGroups: [
            {
                id: 'id_1',
                name: 'Group 2',
            },
        ],
        expectedGroups: [
            {
                id: 'id_1',
                name: 'Group 1',
            },
        ],
    },
];

describe('mergeGroups', () => {
    testTable.forEach((testCase) => {
        test(testCase.name, () => {
            const result = mergeGroups(testCase.oldGroups, testCase.newGroups);
            expect(result).toEqual(testCase.expectedGroups);
        });
    });
});
