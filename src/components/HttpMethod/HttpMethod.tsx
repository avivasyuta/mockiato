import React from 'react';
import { Text, useMantineTheme } from '@mantine/core';
import { HttpMethodType } from '../../types';

const colorsMap: {[key in HttpMethodType]?: string} = {
    [HttpMethodType.GET]: 'green',
    [HttpMethodType.DELETE]: 'red',
    [HttpMethodType.PUT]: 'blue',
    [HttpMethodType.POST]: 'yellow',
    [HttpMethodType.OPTIONS]: 'cyan',
    [HttpMethodType.HEAD]: 'cyan',
};

type HttpStatusProps = {
    method: HttpMethodType
}

export const HttpMethod: React.FC<HttpStatusProps> = ({ method }) => {
    const theme = useMantineTheme();
    const grayColor = theme.colors.gray[5];
    return (
        <Text
            tt="uppercase"
            c={colorsMap[method] ?? grayColor}
            fw={700}
            fz="xs"
            title="HTTP method"
        >
            {method}
        </Text>
    );
};
