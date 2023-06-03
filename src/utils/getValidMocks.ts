import { TMock, TRequest } from '../types';
import { matchUrl } from './matchUrl';

export const getValidMocks = (mocks: TMock[], request: TRequest, origin: string): TMock[] => mocks.filter((mock) => {
    if (!mock.isActive || mock.httpMethod !== request.method) {
        return false;
    }

    return matchUrl(request.url, mock.url, origin);
});
