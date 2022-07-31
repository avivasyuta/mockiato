export enum HttpMethod {
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

export type MessageType = 'intercepted' | 'mockChecked'

export type TResponseType = 'text' | 'json' | 'none'

export type THeader = {
    id: string
    key: string
    value: string
}

export type TMock = {
    id?: number
    url: string
    httpMethod: HttpMethod
    httpStatusCode: number
    delay: number
    response?: string
    responseType: TResponseType
    responseHeaders: THeader[]
    comment?: string
    isActive: boolean
}

export type TRequest = {
    messageId: string
    url: string
    method: string
    body: string
}

export type TMockResponseDTO = {
    messageId: string
    mocks: TMock[]
}

export type TMockFormState = {
    isOpened: boolean
    mock?: TMock
}

export type TMockFormAction = {
    type: 'open' | 'close'
    payload?: TMock
}
