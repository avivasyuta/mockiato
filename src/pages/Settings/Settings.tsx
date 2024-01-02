import React, { useMemo } from 'react';
import { Button, Group, Stack, Switch, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';
import { useStore } from '~/hooks/useStore';
import { isEmpty } from '~/utils/isEmpty';
import { Header } from '~/components/Header';
import { Card } from '~/components/Card';

export const Settings = () => {
    const [logs, setLogs] = useStore('logs');
    const [mocks, setMocks] = useStore('mocks');
    const [network, setNetworks] = useStore('network');
    const [headersProfiles, setHeadersProfiles] = useStore('headersProfiles');
    const [settings, setSettings] = useStore('settings');

    const isClearLogsDisabled = useMemo(() => logs === null || logs.length === 0, [logs]);
    const isClearMocksDisabled = useMemo(() => mocks === null || mocks.length === 0, [mocks]);
    const isClearNetworkDisabled = useMemo(() => network === null || network.length === 0, [network]);
    const isHeadersDisabled = useMemo(() => headersProfiles === null || isEmpty(headersProfiles), [headersProfiles]);

    const handleClearAllLogs = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to clear logs?',
            children: <Text size="sm">All logs for all hosts will be completely removed.</Text>,
            labels: { confirm: 'Clear logs', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'compact-xs' },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => setLogs([]),
        });
    };

    const handleClearAllMocks = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to clear all mocks?',
            children: <Text size="sm">All mocks will be completely removed.</Text>,
            labels: { confirm: 'Clear mocks', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'compact-xs' },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => setMocks([]),
        });
    };

    const handleDeleteProfiles = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to remove all headers profiles?',
            children: <Text size="sm">All headers profiles with headers will be completely removed.</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'compact-xs' },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => setHeadersProfiles({}),
        });
    };

    const handleDeleteNetwork = () => {
        modals.openConfirmModal({
            title: 'Are you sure you want to remove all network logs?',
            children: <Text size="sm">All network logs will be completely removed.</Text>,
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'compact-xs' },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => setNetworks([]),
        });
    };

    const handleToggleNotifications = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) {
            return;
        }

        await setSettings({
            ...settings,
            showNotifications: e.target.checked,
        });
    };

    const handleToggleActiveStatus = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) {
            return;
        }

        await setSettings({
            ...settings,
            showActiveStatus: e.target.checked,
        });
    };

    if (!settings) {
        return null;
    }

    return (
        <>
            <Header>
                <Text
                    fz="sm"
                    fw={500}
                >
                    Settings
                </Text>
            </Header>

            <Group justify="center">
                <Card>
                    <Stack gap="xl">
                        <div>
                            <Text
                                size="sm"
                                fw={500}
                            >
                                Mocks
                            </Text>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                All mocks for all hosts
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightSection={<IconTrash size={12} />}
                                disabled={isClearMocksDisabled}
                                onClick={handleClearAllMocks}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Text
                                size="sm"
                                fw={500}
                            >
                                Logs of mocks
                            </Text>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Data about requests that were intercepted and replaced with mocks for all hosts
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightSection={<IconTrash size={12} />}
                                disabled={isClearLogsDisabled}
                                onClick={handleClearAllLogs}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Text
                                size="sm"
                                fw={500}
                            >
                                Network logs
                            </Text>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Delete all network logs
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightSection={<IconTrash size={12} />}
                                disabled={isClearNetworkDisabled}
                                onClick={handleDeleteNetwork}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Text
                                size="sm"
                                fw={500}
                            >
                                Headers profiles
                            </Text>
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                Header profiles that allow you to substitute headers in requests and responses
                            </Text>

                            <Button
                                mt="xs"
                                size="xs"
                                variant="light"
                                color="red"
                                rightSection={<IconTrash size={12} />}
                                disabled={isHeadersDisabled}
                                onClick={handleDeleteProfiles}
                            >
                                Clear all
                            </Button>
                        </div>

                        <div>
                            <Switch
                                size="xs"
                                onLabel="ON"
                                offLabel="OFF"
                                label="Show notifications"
                                checked={settings?.showNotifications}
                                onChange={handleToggleNotifications}
                            />
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                If you enable this setting, notifications about intercepted requests will be shown on
                                the site page.
                            </Text>
                        </div>

                        <div>
                            <Switch
                                size="xs"
                                onLabel="ON"
                                offLabel="OFF"
                                label="Show active status"
                                checked={settings?.showActiveStatus}
                                onChange={handleToggleActiveStatus}
                            />
                            <Text
                                size="xs"
                                c="dimmed"
                            >
                                If you enable this setting, the page will display mockiato&apos;s running status if it
                                is enabled.
                            </Text>
                        </div>
                    </Stack>
                </Card>
            </Group>
        </>
    );
};
