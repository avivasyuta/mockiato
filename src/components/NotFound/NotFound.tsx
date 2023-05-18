import React from 'react';
import { Text } from '@mantine/core';
import { IconDatabaseX } from '@tabler/icons-react';
import styles from './NotFound.module.css';

type NotFoundProps = {
    text: string
    action?: React.ReactNode
}

export const NotFound: React.FC<NotFoundProps> = ({ text, action }) => (
    <div className={styles.container}>
        <IconDatabaseX color="#868e96" />
        <Text size="xs">{text}</Text>
        {action !== null && action}
    </div>
);
