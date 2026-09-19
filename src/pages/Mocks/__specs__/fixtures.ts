import { HttpMethodType, TMock, TMockGroup } from '~/types';

let mockCounter = 0;
let groupCounter = 0;

export const buildMock = (overrides: Partial<TMock> = {}): TMock => {
  mockCounter += 1;

  return {
    id: `mock-${mockCounter}`,
    url: `https://example.com/api/${mockCounter}`,
    urlType: 'url',
    httpMethod: HttpMethodType.GET,
    httpStatusCode: 200,
    delay: 0,
    responseType: 'json',
    responseHeaders: [],
    isActive: true,
    ...overrides,
  };
};

export const buildGroup = (overrides: Partial<TMockGroup> = {}): TMockGroup => {
  groupCounter += 1;

  return {
    id: `group-${groupCounter}`,
    name: `Group ${groupCounter}`,
    ...overrides,
  };
};
