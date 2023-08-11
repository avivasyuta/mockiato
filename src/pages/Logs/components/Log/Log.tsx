import React, { useState } from 'react';
import {
    Code,
    Collapse,
    Group,
    Text,
} from '@mantine/core';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { TLog } from '../../../../types';
import { HttpMethod } from '../../../../components/HttpMethod';
import { Card } from '../../../../components/Card';
import styles from './Log.module.css';
import { HttpStatus } from '../../../../components/HttpStatus';

type LogProps = {
    log: TLog
}

export const Log: React.FC<LogProps> = ({ log }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <Card
            key={log.date}
            className={styles.log}
            onClick={handleToggle}
        >
            <>
                <Group>
                    {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    <Text size="xs" color="dimmed">{new Date(log.date).toLocaleString()}</Text>
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
                            <Text size="xs" mt="sm" weight={700}>Response headers</Text>
                            <Code block>
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
                            <Text size="xs" mt="sm" weight={700}>Response body</Text>
                            <Code block>{log.mock.response}</Code>
                        </>
                    ) : (
                        <Text size="xs"><strong>Response body:</strong> empty</Text>
                    )}
                </Collapse>
            </>
        </Card>
    );
};
