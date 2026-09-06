import { describe, expect, test } from 'vitest';

import { HttpMethodType, TMock, TMockGroup } from '~/types';

import { parseMocks, ValidationResult } from '../parser';

type TestSuit = {
  name: string;
  data: {
    mocks?: Partial<TMock>[];
    groups?: Partial<TMockGroup>[];
  };
  expected: ValidationResult;
};

type TestSuitGroup = {
  name: string;
  tests: TestSuit[];
};

const testTable: TestSuitGroup[] = [
  {
    name: 'Common',
    tests: [
      {
        name: 'Mocks field is empty',
        data: {
          groups: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [mocks], Message: Invalid input: expected array, received undefined'],
        },
      },
      {
        name: 'Groups field is empty',
        data: {
          mocks: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [groups], Message: Invalid input: expected array, received undefined'],
        },
      },
    ],
  },
  {
    name: 'Groups',
    tests: [
      {
        name: 'Several groups with same id',
        data: {
          groups: [
            {
              id: 'id_1',
              name: 'group1',
            },
            {
              id: 'id_1',
              name: 'group2',
            },
            {
              id: 'id_2',
              name: 'group3',
            },
            {
              id: 'id_2',
              name: 'group4',
            },
            {
              id: 'id_3',
              name: 'group5',
            },
          ],
          mocks: [],
        },
        expected: {
          parsed: null,
          errors: ['There 2 groups with duplicated id [id_1]', 'There 2 groups with duplicated id [id_2]'],
        },
      },
      {
        name: 'Empty required field',
        data: {
          groups: [
            {
              name: 'group2',
            },
          ],
          mocks: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [groups,0,id], Message: Invalid input: expected string, received undefined'],
        },
      },
      {
        name: 'Empty object',
        data: {
          groups: [{}],
          mocks: [],
        },
        expected: {
          parsed: null,
          errors: [
            'Field path: [groups,0,id], Message: Invalid input: expected string, received undefined',
            'Field path: [groups,0,name], Message: Invalid input: expected string, received undefined',
          ],
        },
      },
      {
        name: 'Invalid field type',
        data: {
          groups: [
            {
              // @ts-expect-error intentionally invalid input for validation test
              id: 123,
              name: 'group1',
            },
          ],
          mocks: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [groups,0,id], Message: Invalid input: expected string, received number'],
        },
      },
    ],
  },
  {
    name: 'Mocks',
    tests: [
      {
        name: 'Empty required field',
        data: {
          mocks: [
            {
              id: 'id_1',
              url: 'some_url',
              httpMethod: HttpMethodType.GET,
              httpStatusCode: 2000,
              delay: 0,
              responseType: 'json',
              responseHeaders: [],
              isActive: true,
            },
          ],
          groups: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [mocks,0,urlType], Message: Invalid option: expected one of "url"|"regexp"'],
        },
      },
      {
        name: 'Invalid field type',
        data: {
          mocks: [
            {
              id: 'id_1',
              // @ts-expect-error intentionally invalid input for validation test
              url: [],
              urlType: 'regexp',
              httpMethod: HttpMethodType.GET,
              httpStatusCode: 2000,
              delay: 0,
              responseType: 'json',
              responseHeaders: [],
              isActive: true,
            },
          ],
          groups: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [mocks,0,url], Message: Invalid input: expected string, received array'],
        },
      },
      {
        name: 'Invalid field value',
        data: {
          mocks: [
            {
              id: 'id_1',
              url: 'some_url',
              // @ts-expect-error intentionally invalid input for validation test
              urlType: 'unknown',
              httpMethod: HttpMethodType.GET,
              httpStatusCode: 2000,
              delay: 0,
              responseType: 'json',
              responseHeaders: [],
              isActive: true,
            },
          ],
          groups: [],
        },
        expected: {
          parsed: null,
          errors: ['Field path: [mocks,0,urlType], Message: Invalid option: expected one of "url"|"regexp"'],
        },
      },
      {
        name: 'Invalid group id',
        data: {
          mocks: [
            {
              id: 'id_1',
              url: 'some_url',
              urlType: 'url',
              httpMethod: HttpMethodType.GET,
              httpStatusCode: 2000,
              delay: 0,
              responseType: 'json',
              responseHeaders: [],
              isActive: true,
              groupId: 'unknown',
            },
          ],
          groups: [],
        },
        expected: {
          parsed: null,
          errors: ['Mock [id_1] has invalid group id [unknown]'],
        },
      },
      {
        name: 'Valid group id',
        data: {
          mocks: [
            {
              id: 'id_1',
              url: 'some_url',
              urlType: 'url',
              httpMethod: HttpMethodType.GET,
              httpStatusCode: 2000,
              delay: 0,
              responseType: 'json',
              responseHeaders: [],
              isActive: true,
              groupId: 'group_id_123',
            },
          ],
          groups: [
            {
              id: 'group_id_123',
              name: 'group1',
            },
          ],
        },
        expected: {
          parsed: {
            mocks: [
              {
                id: 'id_1',
                url: 'some_url',
                urlType: 'url',
                httpMethod: HttpMethodType.GET,
                httpStatusCode: 2000,
                delay: 0,
                responseType: 'json',
                responseHeaders: [],
                isActive: true,
                groupId: 'group_id_123',
              },
            ],
            groups: [
              {
                id: 'group_id_123',
                name: 'group1',
              },
            ],
          },
          errors: null,
        },
      },
    ],
  },
];

describe('parseMocks', () => {
  testTable.forEach((group) => {
    describe(group.name, () => {
      group.tests.forEach((testCase) => {
        test(testCase.name, () => {
          const result = parseMocks(JSON.stringify(testCase.data));
          expect(result).toEqual(testCase.expected);
        });
      });
    });
  });
});
