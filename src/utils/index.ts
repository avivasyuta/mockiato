import { TMock, TRequest } from '../types';

export const getValidMocks = (mocks: TMock[], request: TRequest, origin: string): TMock[] => mocks.filter((mock) => {
    if (!mock.isActive || mock.httpMethod !== request.method) {
        return false;
    }

    if (request.url.startsWith(mock.url)) {
        return true;
    }

    // relative mock paths
    if (mock.url.startsWith('/')) {
        try {
            const url = new URL(request.url);
            // mock — /url/path
            // request - https://example.com/url/path*
            // origin - https://example.com
            if (origin === url.origin && url.pathname.startsWith(mock.url)) {
                return true;
            }
        } catch (_) {
            return false;
        }
    }

    return false;
});
