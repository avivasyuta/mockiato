import { HttpMethodType, TMock } from '../../types';

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
    {
        id: '5',
        url: '/path?param=value',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 200,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: true,
    },
];

type Test = {
    title: string
    expected: TMock[]
    data: {
        url: string
        method: string
        origin: string
    }
}

export const testTable: Test[] = [
    {
        title: 'Filter only active mocks.',
        data: {
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'Return empty array if active there are no active mocks of defined http method.',
        data: {
            url: '/item/load/url',
            method: 'POST',
            origin: 'https://www.example.ru',
        },
        expected: [],
    },
    {
        title: 'If mock has relative path, mock should work only for requests to site host [relative request path].',
        data: {
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'If mock has relative path, mock should work only for requests to site host [absolute request path].',
        data: {
            url: 'https://www.example.ru/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[0]],
    },
    {
        title: 'If mock has relative path, mock should not work for requests to another hosts.',
        data: {
            url: 'https://example.ru/item/load/url',
            method: 'GET',
            origin: 'https://another.host.ru',
        },
        expected: [],
    },
    {
        title: 'Wrong request path.',
        data: {
            url: 'example.ru/item/load/url',
            method: 'GET',
            origin: 'https://example.ru',
        },
        expected: [],
    },
    {
        title: 'Get mock if mock has absolute url.',
        data: {
            url: 'https://www.example.ru/s/common/url',
            method: 'GET',
            origin: 'any',
        },
        expected: [testMocks[2]],
    },
    {
        title: 'Uses query string for search mocks.',
        data: {
            url: '/path?param=value&param2=value',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[4]],
    },
    {
        title: 'Query url is relative but mock url is absolute.',
        data: {
            url: '/s/common/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: [testMocks[2]],
    },
];
