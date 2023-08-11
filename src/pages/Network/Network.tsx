import React, { useMemo, useState } from 'react';
import { Badge, Group, Loader, Text } from '@mantine/core';
import { useStore } from '../../hooks/useStore';
import { NotFound } from '../../components/NotFound';
import { NetworkEvent } from './components/NetworkEvent';
import styles from './Network.module.css';

export const Network: React.FC = () => {
    const [tabHost, setTabHost] = useState<string | null>(null);
    const [events] = useStore('network');

    chrome?.tabs?.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        const tab = tabs[0];
        const url = new URL(tab.url as string);
        if (!tabHost) {
            setTabHost(url.hostname);
        }
    });

    const filteredNetwork = useMemo(() => {
        if (!events) {
            return null;
        }

        return events?.filter((event) => event.host === tabHost);
    }, [tabHost, events]);

    if (!tabHost) {
        return null;
    }

    if (!filteredNetwork) {
        return <Loader variant="bars" size="xs" />;
    }

    return (
        <>
            <div className={styles.header}>
                <Group spacing="xs">
                    <Text fz="md" fw={500}>Network for host</Text>
                    <Badge size="xs" variant="filled">
                        {tabHost}
                    </Badge>
                </Group>
            </div>

            <div className={styles.tableHeader}>
                <Text size="xs" color="dimmed" className={styles.date}>Date</Text>
                <Text size="xs" color="dimmed" className={styles.method}>Method</Text>
                <Text size="xs" color="dimmed" className={styles.url}>URL</Text>
                <Text size="xs" color="dimmed" className={styles.code}>Status</Text>
            </div>

            {filteredNetwork.length === 0 ? (
                <NotFound text="There are no logs" />
            ) : (
                <div className={styles.events}>
                    {filteredNetwork.map((event) => <NetworkEvent event={event} />)}
                </div>
            )}
        </>
    );
};
