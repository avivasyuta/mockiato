import { TMock, TRequest } from '../types';

export const getValidMocks = (mocks: TMock[], request: TRequest, origin: string): TMock[] => mocks.filter((mock) => {
    if (!mock.isActive || mock.httpMethod !== request.method) {
        return false;
    }

    const requestUrl = !request.url.startsWith('http') ? `${origin}${request.url}` : request.url;
    const mockUrl = !mock.url.startsWith('http') ? `${origin}${mock.url}` : mock.url;

    return requestUrl.startsWith(mockUrl);
});
