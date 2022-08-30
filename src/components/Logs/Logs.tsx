import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { NotFound } from '../NotFound';
import { TLog } from '../../types';
import { Log } from './Log';
import styles from './Logs.module.css';

export const Logs: React.FC = () => {
    const [tabHost, setTabHost] = useState<string | null>(null);
    const [logs, setLogs] = useState<TLog[]>([]);
    const { store } = useContext(AppContext);

    chrome?.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        const url = new URL(tab.url as string);
        if (!tabHost) {
            setTabHost(url.hostname);
        }
    });

    useEffect(() => {
        const filtered = store.logs?.filter((log) => log.host === tabHost);
        setLogs(filtered);
    }, [tabHost, store.logs]);

    if (!tabHost) {
        return null;
    }

    if (logs.length === 0) {
        return <NotFound text="There are no logs" />;
    }

    return (
        <div className={styles.logs}>
            {logs.map((log) => <Log log={log} />)}
        </div>
    );
};
