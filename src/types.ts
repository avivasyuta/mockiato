export enum HttpMethod {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    PUT = 'PUT',
    DELETE = 'DELETE'
}

export enum MockStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export type MessageType = 'intercepted' | 'mockChecked'

export type TMock = {
    id: number
    url: string
    httpMethod: HttpMethod
    httpStatus: number
    response?: string
    responseHeaders?: Record<string, string>
    status: MockStatus
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
