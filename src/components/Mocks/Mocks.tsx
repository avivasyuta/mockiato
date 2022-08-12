import React, { useCallback, useContext } from 'react';
import {
    ActionIcon,
    Badge,
    Group,
    Paper, Switch,
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
import { nanoid } from 'nanoid';
import { TMock } from '../../types';
import { AppContext } from '../../context/AppContext';
import { NotFound } from '../NotFound';
import { HttpMethod } from '../HttpMethod';
import styles from './Mocks.module.css';

export const Mocks = () => {
    const { dispatchMockForm, store, setStore } = useContext(AppContext);
    const theme = useMantineTheme();

    const handleDeleteMock = (mockId?: string) => async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (e.detail < 2) {
            return;
        }
        setStore({
            ...store,
            mocks: store.mocks.filter((m) => mockId !== m.id),
        });
        showNotification({
            message: 'Mock was deleted',
            icon: <IconCheck size={18} />,
            color: 'green',
        });
    };

    const handleCopyMock = (mock: TMock) => (e: React.MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        dispatchMockForm({
            type: 'open',
            payload: {
                ...mock,
                id: nanoid(),
            },
        });
    };

    const handleEditMock = (mock: TMock) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        dispatchMockForm({
            type: 'open',
            payload: mock,
        });
    };

    const handleClickStatus = (e: React.MouseEvent<HTMLInputElement>) => e.stopPropagation();
    const handleChangeStatus = (mockId: string) => (e: React.ChangeEvent<HTMLInputElement>): void => {
        setStore({
            ...store,
            mocks: store.mocks.map((mock) => {
                if (mock.id === mockId) {
                    return { ...mock, isActive: e.currentTarget.checked };
                }
                return mock;
            }),
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

    if (!store.mocks || store.mocks.length === 0) {
        return <NotFound text="You haven&apos;t added any mock yet." />;
    }

    return (
        <div className={styles.mocks}>
            {store.mocks.map((mock: TMock) => (
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
                        <Switch
                            onLabel="ON"
                            offLabel="OFF"
                            size="sm"
                            checked={mock.isActive}
                            onClick={handleClickStatus}
                            onChange={handleChangeStatus(mock.id)}
                        />

                        <div className={styles.method}>
                            <HttpMethod method={mock.httpMethod} />
                        </div>

                        <Group align="center" className={styles.url}>
                            <Text size="xs" title="URL">{mock.url}</Text>
                            {mock.comment && (
                                <Tooltip
                                    label={mock.comment}
                                    withArrow
                                    position="bottom"
                                    className={styles.comment}
                                >
                                    <span>
                                        <IconInfoCircle size={16} color={theme.colors.blue[4]} />
                                    </span>
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
