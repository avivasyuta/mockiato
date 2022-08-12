import React, { useCallback, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
    ActionIcon,
    Badge,
    Group,
    Paper,
    Text,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import {
    IconCheck,
    IconCopy,
    IconInfoCircle,
    IconTrash,
} from '@tabler/icons';
import { showNotification } from '@mantine/notifications';
import { db } from '../../database';
import { HttpMethod, TMock } from '../../types';
import { MockFormContext } from '../../context/MockFormContext';
import styles from './Mocks.module.css';
import { NotFound } from '../NotFound';

export const Mocks = () => {
    const dispatch = useContext(MockFormContext);
    const theme = useMantineTheme();

    const mocks = useLiveQuery(
        () => db.mocks.toArray(),
    );

    const handleDeleteMock = (mockId?: number) => async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (e.detail < 2) {
            return;
        }
        await db.mocks.delete(mockId as number);
        showNotification({
            message: 'Mock was deleted',
            icon: <IconCheck size={18} />,
            color: 'green',
        });
    };

    const handleCopyMock = (mock: TMock) => (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        dispatch({
            type: 'open',
            payload: {
                ...mock,
                id: undefined,
            },
        });
    };

    const handleEditMock = (mock: TMock) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        dispatch({
            type: 'open',
            payload: mock,
        });
    };

    const getStatusCodeColor = useCallback((code: number): string => {
        if (code >= 100 && code < 200) {
            return 'cyan';
        } if (code >= 200 && code < 300) {
            return 'green';
        } if (code >= 300 && code < 400) {
            return 'gray';
        } if (code >= 400 && code < 500) {
            return 'yellow';
        }
        return 'red';
    }, []);

    const getMethodColor = useCallback((method: HttpMethod): string => {
        switch (method) {
        case HttpMethod.GET: return 'green';
        case HttpMethod.DELETE: return 'red';
        case HttpMethod.PUT: return 'blue';
        case HttpMethod.POST: return 'yellow';
        default: return 'gray';
        }
    }, []);

    if (!mocks || mocks.length === 0) {
        return <NotFound />;
    }

    return (
        <div className={styles.mocks}>
            {mocks.map((mock: TMock) => (
                <Paper
                    component="a"
                    href="#"
                    shadow="sm"
                    radius="md"
                    py="xs"
                    px="md"
                    key={mock.id}
                    onClick={handleEditMock(mock)}
                >
                    <Group>
                        <div className={styles.method}>
                            <Badge
                                variant="light"
                                size="xs"
                                color={getMethodColor(mock.httpMethod)}
                                radius="sm"
                                title="HTTP method"
                            >
                                {mock.httpMethod}
                            </Badge>
                        </div>

                        <Group align="center" className={styles.url}>
                            <Text size="xs" title="URL">{mock.url}</Text>
                            {mock.comment && (
                                // TODO починить тултип
                                <Tooltip
                                    label={mock.comment}
                                    withArrow
                                    position="bottom"
                                    className={styles.comment}
                                >
                                    <IconInfoCircle size={16} color={theme.colors.blue[4]} />
                                </Tooltip>
                            )}
                        </Group>

                        <Group className={styles.code}>
                            <Text
                                size="xs"
                                color={theme.colors.gray[6]}
                            >
                                Status code
                            </Text>
                            <Badge
                                size="xs"
                                variant="outline"
                                color={getStatusCodeColor(mock.httpStatusCode)}
                                radius="sm"
                                title="HTTP status code"
                            >
                                {mock.httpStatusCode}
                            </Badge>
                        </Group>

                        <Tooltip
                            label="Double click to delete"
                            position="bottom"
                            transition="scale-y"
                            openDelay={300}
                            withArrow
                        >
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="xs"
                                radius="sm"
                                title="Delete mock"
                                onClick={handleDeleteMock(mock.id)}
                            >
                                <IconTrash />
                            </ActionIcon>
                        </Tooltip>

                        <ActionIcon
                            variant="subtle"
                            color="cyan"
                            size="xs"
                            radius="sm"
                            title="Clone mock"
                            onClick={handleCopyMock(mock)}
                        >
                            <IconCopy />
                        </ActionIcon>
                    </Group>
                </Paper>
            ))}
        </div>
    );
};
