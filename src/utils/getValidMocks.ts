import { TMock } from '../types';
import { matchUrl } from './matchUrl';

export interface Options {
    mocks: TMock[];
    origin: string;
    url: string;
    method: string;
}

export const getValidMocks = (options: Options): TMock[] => {
    const {
        url,
        method,
        origin,
        mocks,
    } = options;

    return mocks.filter((mock) => {
        if (!mock.isActive || mock.httpMethod !== method) {
            return false;
        }

        return matchUrl(url, mock.url, origin);
    });
};
