import React, { useCallback, useMemo } from 'react';
import { ActionIcon, Badge, Group, Menu, Text } from '@mantine/core';
import { IconDotsVertical, IconTrash } from '@tabler/icons-react';

import { Header } from '~/components/Header';
import { NotFound } from '~/components/NotFound';
import { Spinner } from '~/components/Spinner';
import { useStore } from '~/hooks/useStore';
import { useTabHost } from '~/hooks/useTab';

import { Log } from './components/Log';
import styles from './Logs.module.css';

export const Logs: React.FC = () => {
  const tabHost = useTabHost();
  const [logs, setLogs] = useStore('logs');

  const handleClearLogs = useCallback(() => {
    const logsArray = logs ?? [];
    const filtered = logsArray.filter((log) => log.host !== tabHost);
    setLogs(filtered);
  }, [logs, setLogs, tabHost]);

  const filteredLogs = useMemo(() => {
    if (!logs) {
      return null;
    }

    const filtered = logs?.filter((log) => log.host === tabHost);
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [tabHost, logs]);

  if (!tabHost) {
    return null;
  }

  if (!filteredLogs) {
    return <Spinner />;
  }

  return (
    <>
      <Header
        title={
          <Group gap="xs">
            <Text
              fz="sm"
              fw={500}
            >
              Logs
            </Text>
            <Badge
              size="xs"
              variant="filled"
              color="blue"
              radius="sm"
            >
              {tabHost}
            </Badge>
          </Group>
        }
      >
        <Menu
          shadow="md"
          width={200}
          position="bottom-end"
          styles={{
            item: { fontSize: '0.75rem', padding: '0.5rem' },
          }}
        >
          <Menu.Target>
            <ActionIcon
              variant="default"
              color="blue"
              size="sm"
              radius="sm"
              data-testid="profile-menu/trigger"
            >
              <IconDotsVertical size={14} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={14} />}
              disabled={filteredLogs.length === 0}
              onClick={handleClearLogs}
            >
              Erase all logs
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Header>

      {filteredLogs.length === 0 ? (
        <NotFound text="There are no logs" />
      ) : (
        <div className={styles.logs}>
          {filteredLogs.map((log) => (
            <Log
              key={log.id ?? log.date}
              log={log}
            />
          ))}
        </div>
      )}
    </>
  );
};
