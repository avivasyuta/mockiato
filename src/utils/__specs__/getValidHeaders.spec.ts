import { testTable } from '../__fixtures__/getValidHeaders';
import { getValidHeaders } from '../getValidHeaders';

describe('getValidHeaders', () => {
    testTable.forEach((testCase) => {
        test(testCase.title, () => {
            const result = getValidHeaders({
                headerProfiles: testCase.data.profiles,
                request: testCase.data.request,
                type: testCase.data.type,
                origin: testCase.data.origin,
            });
            expect(result).toEqual(testCase.expected);
        });
    });
});
