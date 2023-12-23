import React, { useState } from 'react';
import {ActionIcon, Code, Collapse, Group, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { TLog, TResponseType } from '../../../../types';
import { HttpMethod } from '../../../../components/HttpMethod';
import { Card } from '../../../../components/Card';
import { HttpStatus } from '../../../../components/HttpStatus';
import { useDisclosure } from '@mantine/hooks';
import styles from './Log.module.css';

type LogProps = {
    log: TLog
}

const getBodyText = (type: TResponseType, body: string) => {
    if (type === 'text') {
        return body;
    }

    try {
        const json = JSON.parse(body);
        return JSON.stringify(json, null, 2);
    } catch (_) {
        return body;
    }
};

export const Log: React.FC<LogProps> = ({ log }) => {
    const [isOpen, { toggle }] = useDisclosure(false);

    return (
        <Card
            key={log.date}
            className={styles.log}
            p="0.2rem 0.6rem"
        >
            <>
                <Group>
                    <ActionIcon
                        variant="subtle"
                        onClick={toggle}
                        size="sm"
                        >
                        {isOpen ? (
                            <IconChevronDown size={14} />
                            ) : (
                                <IconChevronRight size={14} />
                                )}
                    </ActionIcon>

                    <Text size="xs" c="dimmed">{new Date(log.date).toLocaleString()}</Text>
                    <HttpMethod method={log.mock.httpMethod} />
                    <Text size="xs">{log.url}</Text>
                </Group>

                <Collapse in={isOpen}>
                    <Text size="xs">
                        Request was intercepted and response mocked.
                    </Text>

                    <Text size="xs" mt="sm">
                        <strong>Response status code:</strong> <HttpStatus status={log.mock.httpStatusCode} />
                    </Text>

                    <Text size="xs">
                        <strong>Response type:</strong> {log.mock.responseType}
                    </Text>

                    {log.mock.responseHeaders.length > 0 ? (
                        <>
                            <Text size="xs" mt="sm" fw={700}>Response headers</Text>
                            <Code block className={styles.code}>
                                <div className={styles.headers}>
                                    {log.mock.responseHeaders.map((header) => (
                                        <>
                                            <Text size="xs">{header.key}:</Text>
                                            <Text size="xs">{header.value}</Text>
                                        </>
                                    ))}
                                </div>
                            </Code>
                        </>
                    ) : (
                        <Text size="xs">
                            <strong>Response headers:</strong> empty
                        </Text>
                    )}

                    {log.mock.response ? (
                        <>
                            <Text size="xs" mt="sm" fw={700}>Response body</Text>
                        <Code block className={styles.code}>{getBodyText(log.mock.responseType, log.mock.response)}</Code>
                        </>
                    ) : (
                        <Text size="xs"><strong>Response body:</strong> empty</Text>
                    )}
                </Collapse>
            </>
        </Card>
    );
};
