import React, { useCallback, useMemo, useState } from 'react';
import { Button, Loader, Title } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { NotFound } from '../../components/NotFound';
import { useStore } from '../../hooks/useStore';
import { Log } from './Log';
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
        return <Loader variant="bars" size="sm" />;
    }

    return (
        <>
            <div className={styles.header}>
                <Title order={4}>Logs for host {tabHost}</Title>
                <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<IconTrash size={16} />}
                    color="red"
                    compact
                    disabled={filteredLogs.length === 0}
                    title={`Clear logs for host ${tabHost}`}
                    onClick={handleClearMocks}
                >
                    Clear logs
                </Button>
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
