import React, { useMemo } from 'react';
import {
    Button, Group, Paper, Text, Title,
} from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import styles from './Settings..module.css';
import { useStore } from '../../hooks/useStore';

export const Settings = () => {
    const [logs, setLogs] = useStore('logs');

    const isClearLogsDisabled = useMemo(() => logs === null || logs.length === 0, [logs]);

    const handleClearAllLogs = () => {
        setLogs([]);
    };

    return (
        <Group position="center">
            <Paper
                shadow="sm"
                radius="md"
                py="xs"
                px="md"
                className={styles.paper}
            >
                <Title order={4} pb="lg">General settings</Title>

                <div className={styles.setting}>
                    <div>
                        <Text size="sm" weight={500}>Logs of mocks</Text>
                        <Text size="sm" color="gray">
                            Data about requests that were intercepted and replaced with mocks for all hosts
                        </Text>
                    </div>
                    <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        leftIcon={<IconTrash size={16} />}
                        disabled={isClearLogsDisabled}
                        onClick={handleClearAllLogs}
                    >
                        Clear all logs
                    </Button>
                </div>
            </Paper>
        </Group>
    );
};
