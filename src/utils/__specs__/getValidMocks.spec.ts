import { testMocks, testTable } from '../__fixtures__/getValidMocks';
import { getValidMocks } from '../getValidMocks';

describe('getValidMocks', () => {
    testTable.forEach((testCase) => {
        test(testCase.title, () => {
            const result = getValidMocks({
                mocks: testMocks,
                url: testCase.data.url,
                method: testCase.data.method,
                origin: testCase.data.origin,
            });
            expect(result).toEqual(testCase.expected);
        });
    });
});
