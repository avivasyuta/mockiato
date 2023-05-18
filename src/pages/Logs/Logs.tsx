import React, { useCallback, useMemo, useState } from 'react';
import {
    Badge,
    Button, Group, Loader, Text,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { NotFound } from '../../components/NotFound';
import { useStore } from '../../hooks/useStore';
import { Log } from './components/Log';
import styles from './Logs.module.css';

export const Logs: React.FC = () => {
    const [tabHost, setTabHost] = useState<string | null>(null);
    const [logs, setLogs] = useStore('logs');

    chrome?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const url = new URL(tab.url as string);
        if (!tabHost) {
            setTabHost(url.hostname);
        }
    });

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
        return <Loader variant="bars" size="xs" />;
    }

    return (
        <>
            <div className={styles.header}>
                <Group spacing="xs">
                    <Text fz="md" fw={500}>Logs for host</Text>
                    <Badge size="xs" variant="filled">
                        {tabHost}
                    </Badge>
                </Group>

                {filteredLogs.length > 0 && (
                    <Button
                        variant="filled"
                        size="xs"
                        leftIcon={<IconTrash size={14} />}
                        color="red"
                        compact
                        title={`Clear logs for host ${tabHost}`}
                        onClick={handleClearMocks}
                    >
                        Clear logs
                    </Button>
                )}
            </div>

            {filteredLogs.length === 0 ? (
                <NotFound text="There are no logs" />
            ) : (
                <div className={styles.logs}>
                    {filteredLogs.map((log) => <Log log={log} />)}
                </div>
            )}
        </>
    );
};
