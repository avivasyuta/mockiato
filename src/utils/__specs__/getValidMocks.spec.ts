import { testMocks, testTable } from '../__fixtures__/getValidMocks';
import { getValidMocks } from '../index';

describe('getValidMocks', () => {
    testTable.forEach((testCase) => {
        test(testCase.title, () => {
            const result = getValidMocks(testMocks, testCase.data.request, testCase.data.origin);
            expect(result).toEqual(testCase.expected);
        });
    });
});
