import React, { FC } from 'react';
import { Button, Text } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { THeader } from '../../../../../../types';
import styles from './Panel.module.css';

interface PanelProps {
    onAdd: (initialValue: THeader) => void
}

export const Panel: FC<PanelProps> = ({ onAdd }) => {
    const handleOpenForm = () => {
        onAdd({
            id: nanoid(),
            key: '',
            value: '',
            type: 'request',
            isActive: true,
        });
    };

    return (
        <div className={styles.root}>
            <Button
                leftIcon={<IconPlaylistAdd size={20} />}
                variant="gradient"
                size="xs"
                title="Add new header"
                gradient={{ from: 'indigo', to: 'cyan' }}
                compact
                onClick={handleOpenForm}
            >
                Add new header
            </Button>

            <Text size="xs" c="dimmed">
                These headers will be added to requests. If such a header already exists in the request,
                it will be overwritten.
            </Text>
        </div>
    );
};
