import React, { memo } from 'react';
import { Button, Text } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { useStore } from '../../hooks/useStore';
import styles from './Headers.module.css';

const HeadersPage: React.FC = () => {
    const [profiles, setProfiles] = useStore('headersProfiles');

    const handleOpenHeaderForm = () => {

    };

    return (
        <div className={styles.header}>
            <Text fz="md" fw={700}>Headers modifications</Text>

            <Button
                leftIcon={<IconPlaylistAdd size={20} />}
                variant="gradient"
                size="xs"
                title="Add new header"
                gradient={{ from: 'indigo', to: 'cyan' }}
                compact
                onClick={handleOpenHeaderForm}
            >
                Add new mod
            </Button>
        </div>
    );
};

export const Headers = memo(HeadersPage);
