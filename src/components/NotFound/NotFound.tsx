import React from 'react';
import { Text } from '@mantine/core';
import { IconDatabaseX } from '@tabler/icons-react';
import styles from './NotFound.module.css';

type NotFoundProps = {
    text: string
}

export const NotFound: React.FC<NotFoundProps> = ({ text }) => (
    <div className={styles.container}>
        <IconDatabaseX color="#868e96" />
        <Text size="sm">{text}</Text>
    </div>
);
