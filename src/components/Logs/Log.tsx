import React, { useState } from 'react';
import {
    Code,
    Collapse,
    Group,
    Paper,
    Text,
} from '@mantine/core';
import { TLog } from '../../types';
import { HttpMethod } from '../HttpMethod';

type LogProps = {
    log: TLog
}

export const Log: React.FC<LogProps> = ({ log }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <Paper
            component="a"
            href="#"
            shadow="sm"
            radius="md"
            py="xs"
            px="md"
            key={log.date}
            onClick={handleToggle}
        >
            <>
                <Group>
                    <Text size="xs" color="dimmed">{log.date}</Text>
                    <HttpMethod method={log.mock.httpMethod} />
                    <Text size="xs">{log.request.url}</Text>
                </Group>

                <Collapse in={isOpen}>
                    <Text size="xs">
                        Request was intercepted and response mocked.
                    </Text>

                    <Text size="xs">
                        <strong>Response status code:</strong> {log.mock.httpStatusCode}
                    </Text>

                    <Text size="xs">
                        <strong>Response type:</strong> {log.mock.responseType}
                    </Text>

                    {log.mock.responseHeaders.length > 0 ? (
                        <>
                            <Text size="xs" weight={700}>Response headers</Text>
                            <Code block>
                                {log.mock.responseHeaders.map((header) => (
                                    <Text size="xs">{header.key}: {header.value}</Text>
                                ))}
                            </Code>
                        </>
                    ) : (
                        <Text size="xs">
                            <strong>Response headers:</strong> empty
                        </Text>
                    )}

                    {log.mock.response ? (
                        <>
                            <Text size="xs" weight={700}>Response body</Text>
                            <Code block>
                                <Text size="xs">{log.mock.response}</Text>
                            </Code>
                        </>
                    ) : (
                        <Text size="xs"><strong>Response body:</strong> empty</Text>
                    )}
                </Collapse>
            </>
        </Paper>
    );
};
