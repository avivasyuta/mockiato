import { HttpMethodType, TMock, TRequest } from '../../types';

export const testMocks: TMock[] = [
    {
        id: '1',
        url: '/item/load/url',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 200,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: true,
    },
    {
        id: '2',
        url: '/item/load/url',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 400,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: false,
    },
    {
        id: '3',
        url: 'https://www.example.ru/s/common/url',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 200,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: true,
    },
    {
        id: '4',
        url: 'https://www.example.ru/s/common/url',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 400,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: false,
    },
];

type Test = {
    title: string
    expected: TMock[]
    data: {
        request: TRequest
        origin: string
    }
}

export const testTable: Test[] = [
    {
        title: 'Filter only active mocks.',
        data: {
            request: {
                url: '/item/load/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'Return empty array if active there are no active mocks of defined http method.',
        data: {
            request: {
                url: '/item/load/url',
                method: 'POST',
                messageId: '1',
            },
            origin: 'https://www.example.ru',
        },
        expected: [],
    },
    {
        title: 'If mock has relative path, mock should work only for requests to site host [relative request path].',
        data: {
            request: {
                url: '/item/load/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'If mock has relative path, mock should work only for requests to site host [absolute request path].',
        data: {
            request: {
                url: 'https://www.example.ru/item/load/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'If mock has relative path, mock should not work for requests to another hosts.',
        data: {
            request: {
                url: 'https://example.ru/item/load/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'https://another.host.ru',
        },
        expected: [],
    },
    {
        title: 'Wrong request path.',
        data: {
            request: {
                url: 'example.ru/item/load/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'https://example.ru',
        },
        expected: [],
    },
    {
        title: 'Get mock if mock has absolute url.',
        data: {
            request: {
                url: 'https://www.example.ru/s/common/url',
                method: 'GET',
                messageId: '1',
            },
            origin: 'any',
        },
        expected: [testMocks[2]],
    },
];
