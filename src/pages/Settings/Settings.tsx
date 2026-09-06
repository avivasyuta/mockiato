import React, { useMemo } from 'react';
import { Button, Stack, Switch, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash } from '@tabler/icons-react';

import { Header } from '~/components/Header';
import { useStore } from '~/hooks/useStore';
import { isEmpty } from '~/utils/isEmpty';

export const Settings = () => {
  const [logs, setLogs] = useStore('logs');
  const [mocks, setMocks] = useStore('mocks');
  const [mocksGroups, setMockGroups] = useStore('mockGroups');
  const [network, setNetworks] = useStore('network');
  const [headersProfiles, setHeadersProfiles] = useStore('headersProfiles');
  const [settings, setSettings] = useStore('settings');

  const isClearLogsDisabled = useMemo(() => logs === null || logs.length === 0, [logs]);
  const isClearMocksDisabled = useMemo(
    () => (mocks === null || mocks.length === 0) && (mocksGroups === null || mocksGroups.length === 0),
    [mocks, mocksGroups],
  );
  const isClearNetworkDisabled = useMemo(() => network === null || network.length === 0, [network]);
  const isHeadersDisabled = useMemo(() => headersProfiles === null || isEmpty(headersProfiles), [headersProfiles]);

  const handleClearAllLogs = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to clear logs?',
      children: <Text size="sm">All logs for all hosts will be completely removed.</Text>,
      labels: { confirm: 'Clear logs', cancel: 'Cancel' },
      confirmProps: { color: 'red', size: 'xs' },
      cancelProps: {
        size: 'xs',
        variant: 'subtle',
        color: 'gray',
      },
      onConfirm: () => setLogs([]),
    });
  };

  const handleClearAllMocks = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to clear all mocks?',
      children: <Text size="sm">All mocks and mock groups will be completely removed.</Text>,
      labels: { confirm: 'Clear mocks', cancel: 'Cancel' },
      confirmProps: { color: 'red', size: 'xs' },
      cancelProps: {
        size: 'xs',
        variant: 'subtle',
        color: 'gray',
      },
      onConfirm: () => {
        setMocks([]);
        setMockGroups([]);
      },
    });
  };

  const handleDeleteProfiles = () => {
    modals.openConfirmModal({
      title: 'Are you sure you want to remove all headers profiles?',
      children: <Text size="sm">All headers profiles with headers will be completely removed.</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red', size: 'xs' },
      cancelProps: {
        size: 'xs',
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
      confirmProps: { color: 'red', size: 'xs' },
      cancelProps: {
        size: 'xs',
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

  const handleToggleCommentDisplayMode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) {
      return;
    }

    await setSettings({
      ...settings,
      commentDisplayMode: e.target.checked ? 'inline' : 'tooltip',
    });
  };

  const handleToggleDisplayHttpMethodInline = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) {
      return;
    }

    await setSettings({
      ...settings,
      displayHttpMethodInline: e.target.checked,
    });
  };

  if (!settings) {
    return null;
  }

  return (
    <>
      <Header
        title={
          <Text
            fz="sm"
            fw={500}
          >
            Settings
          </Text>
        }
      />

      <Stack gap="xl">
        <Stack gap="md">
          <Text
            size="sm"
            fw={500}
          >
            General settings
          </Text>

          <Stack gap="0.4rem">
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
              If you enable this setting, notifications about intercepted requests will be shown on the site page.
            </Text>
          </Stack>

          <Stack gap="0.4rem">
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
              If you enable this setting, the page will display mockiato&apos;s running status if it is enabled.
            </Text>
          </Stack>

          <Stack gap="0">
            <Text size="xs">Network logs</Text>

            <Button
              mt="xs"
              size="xs"
              variant="light"
              color="red"
              w="fit-content"
              leftSection={<IconTrash size={12} />}
              disabled={isClearNetworkDisabled}
              onClick={handleDeleteNetwork}
            >
              Erase all data
            </Button>
          </Stack>
        </Stack>

        <Stack gap="md">
          <Text
            size="sm"
            fw={500}
          >
            Mocks
          </Text>

          <Stack gap="0.4rem">
            <Switch
              size="xs"
              onLabel="ON"
              offLabel="OFF"
              label="Show comments inline"
              checked={settings?.commentDisplayMode === 'inline'}
              onChange={handleToggleCommentDisplayMode}
            />
            <Text
              size="xs"
              c="dimmed"
            >
              Display mock comments as inline text in the mock list instead of a tooltip on hover.
            </Text>
          </Stack>

          <Stack gap="0.4rem">
            <Switch
              size="xs"
              onLabel="ON"
              offLabel="OFF"
              label="Show http method inline"
              checked={settings?.displayHttpMethodInline}
              onChange={handleToggleDisplayHttpMethodInline}
            />
            <Text
              size="xs"
              c="dimmed"
            >
              Display the HTTP method as inline text in the mock snippet.
            </Text>
          </Stack>

          <Stack gap="0">
            <Text size="xs">Mocks data</Text>

            <Button
              mt="xs"
              size="xs"
              variant="light"
              color="red"
              w="fit-content"
              leftSection={<IconTrash size={12} />}
              disabled={isClearMocksDisabled}
              onClick={handleClearAllMocks}
            >
              Erase all data
            </Button>
          </Stack>

          <Stack gap="0.1rem">
            <Text size="xs">Data about requests that were intercepted and replaced with mocks</Text>

            <Button
              mt="xs"
              size="xs"
              variant="light"
              color="red"
              w="fit-content"
              leftSection={<IconTrash size={12} />}
              disabled={isClearLogsDisabled}
              onClick={handleClearAllLogs}
            >
              Erase all data
            </Button>
          </Stack>
        </Stack>

        <Stack gap="md">
          <Text
            size="sm"
            fw={500}
          >
            Headers
          </Text>

          <Stack gap="0">
            <Text size="xs">Header profiles that allow you to substitute headers in requests and responses</Text>

            <Button
              mt="xs"
              size="xs"
              variant="light"
              color="red"
              w="fit-content"
              leftSection={<IconTrash size={12} />}
              disabled={isHeadersDisabled}
              onClick={handleDeleteProfiles}
            >
              Erase all data
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </>
  );
};
