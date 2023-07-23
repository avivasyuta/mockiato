import { THeadersProfile, THeaderType } from '../types';
import { matchUrl } from './matchUrl';

export interface Options {
    headerProfiles: Record<string, THeadersProfile>
    url: string
    method: string
    type: THeaderType
    origin: string
}

export const getValidHeaders = (options: Options): Record<string, string> => {
    const {
        headerProfiles,
        url,
        method,
        type,
        origin,
    } = options;

    const activeProfiles = Object
        .values(headerProfiles)
        .filter((p) => p.status === 'enabled' && p.headers.length > 0);

    const headers: Record<string, string> = {};

    activeProfiles.forEach((profile) => {
        profile.headers.forEach((header) => {
            let isValidUrl = true;

            if (header.url) {
                isValidUrl = header.httpMethod === method && matchUrl(url, header.url, origin);
            }

            const isValid = header.isActive && header.type === type && isValidUrl;

            if (isValid) {
                headers[header.key] = header.value;
            }
        });
    });

    return headers;
};
