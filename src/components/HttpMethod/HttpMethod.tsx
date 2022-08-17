import React from 'react';
import { Badge } from '@mantine/core';
import { HttpMethodType } from '../../types';

const colorsMap: {[key in HttpMethodType]?: string} = {
    [HttpMethodType.GET]: 'green',
    [HttpMethodType.DELETE]: 'red',
    [HttpMethodType.PUT]: 'blue',
    [HttpMethodType.POST]: 'yellow',
};

type HttpStatusProps = {
    method: HttpMethodType
}

export const HttpMethod: React.FC<HttpStatusProps> = ({ method }) => (
    <Badge
        variant="light"
        size="xs"
        color={colorsMap[method] ?? 'gray'}
        radius="sm"
        title="HTTP method"
    >
        {method}
    </Badge>
);
