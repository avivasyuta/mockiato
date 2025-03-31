import { type UrlType } from '~/types';

type MatchUrlParams = {
    requestUrl: string;
    entityUrl: string;
    entityUrlType: UrlType;
    origin: string;
};

export const matchUrl = ({ requestUrl, entityUrl, origin, entityUrlType }: MatchUrlParams): boolean => {
    const reqUrl = !requestUrl.startsWith('http') ? `${origin}${requestUrl}` : requestUrl;
    const entUrl = !entityUrl.startsWith('http') ? `${origin}${entityUrl}` : entityUrl;

    if (entityUrlType === 'url') {
        return reqUrl.startsWith(entUrl);
    }

    return new RegExp(entityUrl).test(requestUrl);
};
