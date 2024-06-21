export enum HttpMethodType {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    PUT = 'PUT',
    DELETE = 'DELETE',
    OPTIONS = 'OPTIONS',
    HEAD = 'HEAD',
    LINK = 'LINK',
    UNLINK = 'UNLINK',
    LOCK = 'LOCK',
    UNLOCK = 'UNLOCK',
    PURGE = 'PURGE',
}

export type MessageType = 'requestIntercepted' | 'requestChecked' | 'responseIntercepted' | 'settingsChanged';

export type TResponseType = 'text' | 'json' | 'none';

export type THeaderType = 'request' | 'response';

export type TMockHeader = {
    id: string;
    key: string;
    value: string;
};

export type THeader = {
    id: string;
    key: string;
    value: string;
    type: THeaderType;
    isActive: boolean;
    url?: string;
    httpMethod?: HttpMethodType;
};

export type TMock = {
    id: string;
    url: string;
    httpMethod: HttpMethodType;
    httpStatusCode: number;
    delay: number;
    response?: string;
    responseType: TResponseType;
    responseHeaders: TMockHeader[];
    comment?: string;
    groupId?: string;
    isActive: boolean;
};

export type TNetworkEvent = {
    host: string;
    date: string;
    request: {
        url: string;
        method: HttpMethodType;
    };
    response: {
        body?: string;
        type: TResponseType;
        headers: TMockHeader[];
        httpStatusCode: number;
    };
};

export type TInterceptedRequestDTO = {
    messageId: string;
    url: string;
    method: string;
};

export type TInterceptedResponseDTO = {
    event: TNetworkEvent;
};

export type TInterceptedRequestMockDTO = {
    messageId: string;
    mock?: TMock | null;
    headers: Record<string, string>;
};

export type TRoute = 'logs' | 'mocks' | 'settings' | 'headers' | 'network';

export type TLog = {
    url: string;
    method: string;
    mock: TMock;
    date: string;
    host: string;
};

export type THeaderStatus = 'enabled' | 'disabled';
export type THeadersProfileStatus = 'enabled' | 'disabled';

export type THeadersProfile = {
    id: string;
    name: string;
    status: THeadersProfileStatus;
    lastActive: boolean;
    headers: THeader[];
};

export type TMockGroup = {
    id: string;
    name: string;
};

export type TStoreSettings = {
    showNotifications: boolean;
    showActiveStatus: boolean;
    enabledHosts: Record<string, boolean>;
    showMobileNavBar: boolean;
};

export type TStore = {
    mocks: TMock[];
    mockGroups: TMockGroup[];
    logs: TLog[];
    headersProfiles: Record<string, THeadersProfile>;
    network: TNetworkEvent[];
    settings: TStoreSettings;
};

export type TUpdateStore = Record<
    string,
    {
        newValue: TStore;
        oldValue: TStore;
    }
>;

export type TStoreKey = keyof TStore;
