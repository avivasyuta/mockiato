import React from 'react';
import {
    Button, Group, Paper, Text,
} from '@mantine/core';
import styles from './Settings..module.css';

export const Settings = () => (
    <Group position="center">
        <Paper
            shadow="sm"
            radius="md"
            py="xs"
            px="md"
            className={styles.paper}
        >
            <Text>Other</Text>
            <div>
                <Text>Logs of mocks</Text>
                <Text>Data about requests that were intercepted and replaced with mocks for all hosts</Text>
                <Button>Clear</Button>
            </div>
        </Paper>
    </Group>
);
