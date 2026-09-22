import { HttpMethodType, TLog, TMock } from '~/types';

let mockCounter = 0;
let logCounter = 0;

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

export const buildLog = (overrides: Partial<TLog> = {}): TLog => {
  logCounter += 1;
  const mock = overrides.mock ?? buildMock();

  return {
    id: `log-${logCounter}`,
    url: mock.url,
    method: mock.httpMethod,
    date: new Date(2026, 0, 1, 0, 0, 0, logCounter).toISOString(),
    host: 'example.com',
    mock,
    ...overrides,
  };
};
