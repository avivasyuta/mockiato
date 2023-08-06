import React from 'react';
import { Badge } from '@mantine/core';

const getStatusCodeColor = (code: number): string => {
    if (code >= 100 && code < 200) {
        return 'cyan';
    } if (code >= 200 && code < 300) {
        return 'green';
    } if (code >= 300 && code < 400) {
        return 'dark';
    } if (code >= 400 && code < 500) {
        return 'orange';
    }
    return 'red';
};

type HttpStatusProps = {
    status: number
}

export const HttpStatus: React.FC<HttpStatusProps> = ({ status }) => (
    <Badge
        size="xs"
        variant="light"
        color={getStatusCodeColor(status)}
        radius="sm"
        title="HTTP status code"
    >
        {status}
    </Badge>
);
