import React, { memo } from 'react';
import { ActionIcon, Code, Collapse, Group, Text, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconSquarePlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { showNotification } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { TMock, TNetworkEvent } from '~/types';
import { Card } from '~/components/Card';
import { HttpMethod } from '~/components/HttpMethod';
import { ResponseBody } from '~/components/ResponseBody';
import { HttpStatus } from '~/components/HttpStatus';
import { iconSize } from '~/contstant';
import { useStore } from '~/hooks/useStore';
import styles from './NetworkEvent.module.css';

type NetworkEventProps = {
    event: TNetworkEvent;
};

const NetworkEventComponent: React.FC<NetworkEventProps> = ({ event }) => {
    const [isOpen, { toggle }] = useDisclosure(false);
    const [mocks, setMocks] = useStore('mocks', []);

    const handleCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const mock: TMock = {
            id: nanoid(),
            url: event.request.url,
            httpMethod: event.request.method,
            httpStatusCode: event.response.httpStatusCode,
            delay: 0,
            response: event.response.body,
            responseType: event.response.type,
            responseHeaders: event.response.headers,
            isActive: true,
        };
        setMocks([mock, ...(mocks ?? [])]);

        showNotification({
            message: 'Mock was created. See new mock in Response Mocks tab.',
            color: 'green',
        });
    };

    return (
        <Card
            key={event.date}
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
                        {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                    </ActionIcon>

                    <Text
                        size="xs"
                        c="dimmed"
                    >
                        {new Date(event.date).toLocaleString()}
                    </Text>

                    <div className={styles.method}>
                        <HttpMethod method={event.request.method} />
                    </div>

                    <Text
                        size="xs"
                        title={event.request.url}
                        className={styles.url}
                    >
                        {event.request.url}
                    </Text>

                    <Text size="xs">
                        <HttpStatus status={event.response.httpStatusCode} />
                    </Text>

                    <Group gap="0.4rem">
                        <Tooltip
                            label="Create mock from response"
                            position="bottom"
                            transitionProps={{ transition: 'scale-y' }}
                            openDelay={300}
                            withArrow
                        >
                            <ActionIcon
                                variant="subtle"
                                color="blue"
                                size="sm"
                                radius="sm"
                                onClick={handleCreate}
                            >
                                <IconSquarePlus size={iconSize} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>

                <Collapse in={isOpen}>
                    <Text size="xs">
                        <strong>Response type:</strong> {event.response.type}
                    </Text>

                    {event.response.headers.length > 0 ? (
                        <>
                            <Text
                                size="xs"
                                mt="sm"
                                fw={700}
                            >
                                Response headers
                            </Text>
                            <Code
                                block
                                className={styles.code}
                            >
                                <div className={styles.headers}>
                                    {event.response.headers.map((header) => (
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

                    <ResponseBody body={event.response.body} />
                </Collapse>
            </>
        </Card>
    );
};

export const NetworkEvent = memo(NetworkEventComponent);
