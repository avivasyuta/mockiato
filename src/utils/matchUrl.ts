export const matchUrl = (requestUrl: string, entityUrl: string, origin: string): boolean => {
    const reqUrl = !requestUrl.startsWith('http') ? `${origin}${requestUrl}` : requestUrl;
    const entUrl = !entityUrl.startsWith('http') ? `${origin}${entityUrl}` : entityUrl;

    return reqUrl.startsWith(entUrl);
};
