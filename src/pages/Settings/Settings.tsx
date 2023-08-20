import React, { useMemo } from 'react';
import { Button, Group, Switch, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useStore } from '../../hooks/useStore';
import { Card } from '../../components/Card';
import { isEmpty } from '../../utils/isEmpty';
import { Content } from '../../components/Contnent';
import styles from './Settings..module.css';
import { Header } from '../../components/Header';
import { ExcludedHosts } from './ExcludedHosts';
import { TExcludedHost } from '../../types';

export const Settings = () => {
    const [logs, setLogs] = useStore('logs');
    const [mocks, setMocks] = useStore('mocks');
    const [headersProfiles, setHeadersProfiles] = useStore('headersProfiles');
    const [settings, setSettings] = useStore('settings');

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

    const handleToggleNotifications = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) {
            return;
        }

        setSettings({
            ...settings,
            showNotifications: e.target.checked,
        });
    };

    const handleChangeExcludedHosts = (hosts: TExcludedHost[]) => {
        if (!settings) {
            return;
        }
        setSettings({
            ...settings,
            excludedHosts: hosts,
        });
    };

    if (!settings) {
        return null;
    }

    return (
        <>
            <Header>
                <Text fz="sm" fw={500}>Settings</Text>
            </Header>

            <Content>
                <Group position="center">
                    <Card className={styles.card}>
                        <div>
                            <Switch
                                size="xs"
                                onLabel="ON"
                                offLabel="OFF"
                                label="Show notifications"
                                checked={settings?.showNotifications}
                                onChange={handleToggleNotifications}
                            />
                            <Text size="xs" c="dimmed">
                                If you enable this setting, notifications about intercepted requests will
                                be shown on the site page.
                            </Text>
                        </div>

                        <div>
                            <Text size="sm" weight={500}>Mocks</Text>
                            <Text size="xs" c="dimmed">
                                All mocks for all hosts
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightIcon={<IconTrash size={12} />}
                                disabled={isClearMocksDisabled}
                                onClick={handleClearAllMocks}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Text size="sm" weight={500}>Logs of mocks</Text>
                            <Text size="xs" c="dimmed">
                                Data about requests that were intercepted and replaced with mocks for all hosts
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightIcon={<IconTrash size={12} />}
                                disabled={isClearLogsDisabled}
                                onClick={handleClearAllLogs}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Text size="sm" weight={500}>Headers profiles</Text>
                            <Text size="xs" c="dimmed">
                                Header profiles that allow you to substitute headers in requests and responses
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightIcon={<IconTrash size={12} />}
                                disabled={isHeadersDisabled}
                                onClick={handleDeleteProfiles}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <ExcludedHosts hosts={settings.excludedHosts} onChange={handleChangeExcludedHosts} />
                        </div>
                    </Card>
                </Group>
            </Content>
        </>
    );
};
