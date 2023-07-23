import { testTable } from '../__fixtures__/getValidHeaders';
import { getValidHeaders } from '../getValidHeaders';

describe('getValidHeaders', () => {
    testTable.forEach((testCase) => {
        test(testCase.title, () => {
            const result = getValidHeaders({
                headerProfiles: testCase.data.headerProfiles,
                url: testCase.data.url,
                method: testCase.data.method,
                type: testCase.data.type,
                origin: testCase.data.origin,
            });
            expect(result).toEqual(testCase.expected);
        });
    });
});
