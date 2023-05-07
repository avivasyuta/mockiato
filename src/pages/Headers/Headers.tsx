import React, { memo } from 'react';
import { Button, Title } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { useStore } from '../../hooks/useStore';
import styles from './Headers.module.css';

const HeadersPage: React.FC = () => {
    const [profiles, setProfiles] = useStore('headersProfiles');

    const handleOpenHeaderForm = () => {

    };

    return (
        <div className={styles.header}>
            <Title order={4}>Headers modifications</Title>

            <Button
                leftIcon={<IconPlaylistAdd size={20} />}
                variant="gradient"
                size="xs"
                title="Add new header"
                gradient={{ from: 'indigo', to: 'cyan' }}
                onClick={handleOpenHeaderForm}
            >
                Add new mod
            </Button>
        </div>
    );
};

export const Headers = memo(HeadersPage);
