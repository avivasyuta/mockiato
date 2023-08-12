import React, { memo, useState } from 'react';
import { ActionIcon, Code, Collapse, Group, Text, Tooltip } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconSquarePlus } from '@tabler/icons-react';
import { TNetworkEvent, TResponseType } from '../../../../types';
import { Card } from '../../../../components/Card';
import { HttpMethod } from '../../../../components/HttpMethod';
import styles from './NetworkEvent.module.css';
import { HttpStatus } from '../../../../components/HttpStatus';
import { iconSize } from '../../../../contstant';

type NetworkEventProps = {
    event: TNetworkEvent
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

const NetworkEventComponent: React.FC<NetworkEventProps> = ({ event }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen((prev) => !prev);
    };

    const handleCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    };

    return (
        <Card
            key={event.date}
            className={styles.log}
            onClick={handleToggle}
        >
            <>
                <Group>
                    {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}

                    <Text size="xs" color="dimmed">{new Date(event.date).toLocaleString()}</Text>

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

                    <Group spacing="0.4rem">
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
                            <Text size="xs" mt="sm" weight={700}>Response headers</Text>
                            <Code block className={styles.code}>
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

                    {event.response.body ? (
                        <>
                            <Text size="xs" mt="sm" weight={700}>Response body</Text>
                            <Code block className={styles.code}>
                                {getBodyText(event.response.type, event.response.body)}
                            </Code>
                        </>
                    ) : (
                        <Text size="xs"><strong>Response body:</strong> empty</Text>
                    )}
                </Collapse>
            </>
        </Card>
    );
};

export const NetworkEvent = memo(NetworkEventComponent);
