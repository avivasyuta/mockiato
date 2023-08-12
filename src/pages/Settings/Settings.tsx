import React, { useMemo } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/Card';
import { isEmpty } from '../../utils/isEmpty';
import { Content } from '../../components/Contnent';
import styles from './Settings..module.css';

export const Settings = () => {
    const [logs, setLogs] = useStore('logs');
    const [mocks, setMocks] = useStore('mocks');
    const [headersProfiles, setHeadersProfiles] = useStore('headersProfiles');

    const isClearLogsDisabled = useMemo(() => logs === null || logs.length === 0, [logs]);
    const isClearMocksDisabled = useMemo(() => mocks === null || mocks.length === 0, [mocks]);
    const isHeadersDisabled = useMemo(() => headersProfiles === null || isEmpty(headersProfiles), [headersProfiles]);

    const handleClearAllLogs = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to clear logs?',
            children: (
                <Text size="sm">
                    All logs for all hosts will be completely removed.
                </Text>
            ),
            labels: { confirm: 'Clear logs', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'xs', compact: true },
            cancelProps: {
                size: 'xs',
                variant: 'subtle',
                compact: true,
                color: 'gray',
            },
            onConfirm: () => setLogs([]),
        });
    };

    const handleClearAllMocks = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to clear all mocks?',
            children: (
                <Text size="sm">
                    All mocks will be completely removed.
                </Text>
            ),
            labels: { confirm: 'Clear mocks', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'xs', compact: true },
            cancelProps: {
                size: 'xs',
                variant: 'subtle',
                compact: true,
                color: 'gray',
            },
            onConfirm: () => setMocks([]),
        });
    };

    const handleDeleteProfiles = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to delete all headers profiles?',
            children: (
                <Text size="sm">
                    All headers profiles with headers will be completely removed.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'xs', compact: true },
            cancelProps: {
                size: 'xs',
                variant: 'subtle',
                compact: true,
                color: 'gray',
            },
            onConfirm: () => setHeadersProfiles({}),
        });
    };

    return (
        <Content>
            <Group position="center">
                <Card w="900px" p="0.5rem 0.8rem">
                    <Text fz="md" fw={500}>General settings</Text>

                    <div className={styles.setting}>
                        <div>
                            <Text size="sm" weight={500}>Mocks</Text>
                            <Text size="sm" c="dimmed">
                                All mocks for all hosts
                            </Text>
                        </div>

                        <Button
                            size="xs"
                            variant="filled"
                            color="red"
                            compact
                            leftIcon={<IconTrash size={16} />}
                            disabled={isClearMocksDisabled}
                            onClick={handleClearAllMocks}
                        >
                            Clear all
                        </Button>
                    </div>

                    <div className={styles.setting}>
                        <div>
                            <Text size="sm" weight={500}>Logs of mocks</Text>
                            <Text size="sm" c="dimmed">
                                Data about requests that were intercepted and replaced with mocks for all hosts
                            </Text>
                        </div>

                        <Button
                            size="xs"
                            variant="filled"
                            color="red"
                            compact
                            leftIcon={<IconTrash size={16} />}
                            disabled={isClearLogsDisabled}
                            onClick={handleClearAllLogs}
                        >
                            Clear all
                        </Button>
                    </div>

                    <div className={styles.setting}>
                        <div>
                            <Text size="sm" weight={500}>Headers profiles</Text>
                            <Text size="sm" c="dimmed">
                                Header profiles that allow you to substitute headers in requests and responses
                            </Text>
                        </div>

                        <Button
                            size="xs"
                            variant="filled"
                            color="red"
                            compact
                            leftIcon={<IconTrash size={16} />}
                            disabled={isHeadersDisabled}
                            onClick={handleDeleteProfiles}
                        >
                            Clear all
                        </Button>
                    </div>
                </Card>
            </Group>
        </Content>
    );
};
