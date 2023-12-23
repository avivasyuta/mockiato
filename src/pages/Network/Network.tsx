import React, { useMemo } from 'react';
import { Badge, Group, Text } from '@mantine/core';
import { useStore } from '../../hooks/useStore';
import { NotFound } from '../../components/NotFound';
import { NetworkEvent } from './components/NetworkEvent';
import { useTabHost } from '../../hooks/useTab';
import { Header } from '../../components/Header';
import { Spinner } from '../../components/Spinner';
import styles from './Network.module.css';

export const Network: React.FC = () => {
    const tabHost = useTabHost();
    const [events] = useStore('network', []);

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
        return <Spinner />;
    }

    return (
        <>
            <Header>
                <Group gap="xs">
                    <Text fz="sm" fw={500}>Network</Text>
                    <Badge size="xs" variant="filled">
                        {tabHost}
                    </Badge>
                </Group>
            </Header>

            {filteredNetwork.length === 0 ? (
                <NotFound text="There are no requsts" />
            ) : (
                <>
                    <div className={styles.tableHeader}>
                        <Text size="xs" c="dimmed" className={styles.date}>Date</Text>
                        <Text size="xs" c="dimmed" className={styles.method}>Method</Text>
                        <Text size="xs" c="dimmed" className={styles.url}>URL</Text>
                        <Text size="xs" c="dimmed" className={styles.code}>Status</Text>
                    </div>

                    <div className={styles.events}>
                        {filteredNetwork.map((event) => <NetworkEvent event={event} />)}
                    </div>
                </>
            )}
        </>
    );
};
