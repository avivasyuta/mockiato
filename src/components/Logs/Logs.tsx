import React, {
    useCallback, useContext, useEffect, useState,
} from 'react';
import { Button, Title } from '@mantine/core';
import { IconCircleMinus } from '@tabler/icons';
import { AppContext } from '../../context/AppContext';
import { NotFound } from '../NotFound';
import { TLog } from '../../types';
import { Log } from './Log';
import styles from './Logs.module.css';

export const Logs: React.FC = () => {
    const [tabHost, setTabHost] = useState<string | null>(null);
    const [logs, setLogs] = useState<TLog[]>([]);
    const { store, setStore } = useContext(AppContext);

    chrome?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const url = new URL(tab.url as string);
        if (!tabHost) {
            setTabHost(url.hostname);
        }
    });

    const handleClearMocks = useCallback(() => {
        const filtered = store.logs.filter((log) => log.host !== tabHost);
        setStore({
            ...store,
            logs: filtered,
        });
    }, [store, tabHost]);

    useEffect(() => {
        const filtered = store.logs?.filter((log) => log.host === tabHost);
        setLogs(filtered);
    }, [tabHost, store.logs]);

    if (!tabHost) {
        return null;
    }

    return (
        <>
            <div className={styles.header}>
                <Title order={5}>Logs for host {tabHost}</Title>
                <Button
                    variant="outline"
                    size="xs"
                    leftIcon={<IconCircleMinus size={16} />}
                    color="red"
                    compact
                    disabled={logs.length === 0}
                    title={`Clear logs for host ${tabHost}`}
                    onClick={handleClearMocks}
                >
                    Clear logs
                </Button>
            </div>

            {logs.length === 0 ? (
                <NotFound text="There are no logs" />
            ) : (
                <div className={styles.logs}>
                    {logs.map((log) => <Log log={log} />)}
                </div>
            )}
        </>
    );
};
