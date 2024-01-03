import React, { FC } from 'react';
import { Code, Text } from '@mantine/core';
import styles from './ResponseBody.module.css';

type ResponseBodyProps = {
    body?: string;
};

const getBodyText = (body: string) => {
    try {
        const json = JSON.parse(body);
        return JSON.stringify(json, null, 2);
    } catch (_) {
        return body;
    }
};

export const ResponseBody: FC<ResponseBodyProps> = ({ body }) => {
    if (!body) {
        return (
            <Text size="xs">
                <strong>Response body:</strong> empty
            </Text>
        );
    }

    return (
        <>
            <Text
                size="xs"
                mt="sm"
                fw={700}
            >
                Response body
            </Text>

            <Code
                block
                className={styles.code}
            >
                {getBodyText(body)}
            </Code>
        </>
    );
};
