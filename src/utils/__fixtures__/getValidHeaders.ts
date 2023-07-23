import { HttpMethodType } from '../../types';
import { Options } from '../getValidHeaders';

type Test = {
    title: string
    expected: Record<string, string>
    data: Options
}

export const testTable: Test[] = [
    {
        title: 'Get headers only from enabled profiles.',
        data: {
            type: 'request',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [
                        {
                            id: '1',
                            key: 'x-key-1',
                            value: 'value_1',
                            type: 'request',
                            isActive: true,
                        },
                    ],
                },
                2: {
                    id: '2',
                    name: 'name',
                    status: 'disabled',
                    lastActive: false,
                    headers: [
                        {
                            id: '2',
                            key: 'x-key-2',
                            value: 'value_2',
                            type: 'request',
                            isActive: true,
                        },
                    ],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {
            'x-key-1': 'value_1',
        },
    },
    {
        title: 'Get only active headers.',
        data: {
            type: 'request',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [
                        {
                            id: '1',
                            key: 'x-key-1',
                            value: 'value_1',
                            type: 'request',
                            isActive: true,
                        },
                        {
                            id: '2',
                            key: 'x-key-2',
                            value: 'value_2',
                            type: 'request',
                            isActive: false,
                        },
                    ],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {
            'x-key-1': 'value_1',
        },
    },
    {
        title: 'Get only request headers.',
        data: {
            type: 'request',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [
                        {
                            id: '1',
                            key: 'x-key-1',
                            value: 'value_1',
                            type: 'request',
                            isActive: true,
                        },
                        {
                            id: '2',
                            key: 'x-key-2',
                            value: 'value_2',
                            type: 'response',
                            isActive: true,
                        },
                    ],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {
            'x-key-1': 'value_1',
        },
    },
    {
        title: 'Get only response headers.',
        data: {
            type: 'response',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [
                        {
                            id: '1',
                            key: 'x-key-1',
                            value: 'value_1',
                            type: 'request',
                            isActive: true,
                        },
                        {
                            id: '2',
                            key: 'x-key-2',
                            value: 'value_2',
                            type: 'response',
                            isActive: true,
                        },
                    ],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {
            'x-key-2': 'value_2',
        },
    },
    {
        title: 'Return empty object if there are no valid headers.',
        data: {
            type: 'response',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {},
    },
    {
        title: 'Get headers which match request url.',
        data: {
            type: 'response',
            headerProfiles: {
                1: {
                    id: '1',
                    name: 'name',
                    status: 'enabled',
                    lastActive: true,
                    headers: [
                        {
                            id: '1',
                            key: 'x-key-1',
                            value: 'value_1',
                            type: 'request',
                            isActive: true,
                        },
                        {
                            id: '2',
                            key: 'x-key-2',
                            value: 'value_2',
                            type: 'response',
                            isActive: true,
                            url: '/item/load/url',
                            httpMethod: HttpMethodType.GET,
                        },
                    ],
                },
            },
            url: '/item/load/url',
            method: 'GET',
            origin: 'https://www.example.ru',
        },
        expected: {
            'x-key-2': 'value_2',
        },
    },
];
