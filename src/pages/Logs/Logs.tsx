import React, { useCallback, useMemo } from 'react';
import { Badge, Button, Group, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { NotFound } from '~/components/NotFound';
import { useStore } from '~/hooks/useStore';
import { useTabHost } from '~/hooks/useTab';
import { Header } from '~/components/Header';
import { Spinner } from '~/components/Spinner';
import { Log } from './components/Log';
import styles from './Logs.module.css';

export const Logs: React.FC = () => {
    const tabHost = useTabHost();
    const [logs, setLogs] = useStore('logs');

    const handleClearMocks = useCallback(() => {
        const logsArray = logs ?? [];
        const filtered = logsArray.filter((log) => log.host !== tabHost);
        setLogs(filtered);
    }, [logs, tabHost]);

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
            <Header>
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

                {filteredLogs.length > 0 && (
                    <Button
                        variant="light"
                        size="compact-xs"
                        rightSection={<IconTrash size={12} />}
                        color="red"
                        title={`Clear logs for host ${tabHost}`}
                        onClick={handleClearMocks}
                    >
                        Clear logs
                    </Button>
                )}
            </Header>

            {filteredLogs.length === 0 ? (
                <NotFound text="There are no logs" />
            ) : (
                <div className={styles.logs}>
                    {filteredLogs.map((log) => (
                        <Log log={log} />
                    ))}
                </div>
            )}
        </>
    );
};
