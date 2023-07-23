import React, { memo, useMemo } from 'react';
import {
    Badge, Button, Flex, Group, Modal, Text,
} from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { useStore } from '../../hooks/useStore';
import { Spinner } from '../../components/Spinner';
import { overlaySettings } from '../../contstant';
import { AddProfileForm } from './components/AddProfileForm';
import { THeadersProfile, THeaderStatus } from '../../types';
import { NotFound } from '../../components/NotFound';
import { isEmpty } from '../../utils/isEmpty';
import { Profile } from './components/Profile';
import { ProfilesActions } from './components/ProfilesActions';
import {
    addProfile, changeProfile, changeProfileStatus, deleteProfile, setLastActive,
} from './helpers';
import styles from './Headers.module.css';

const HeadersPage: React.FC = () => {
    const [profiles, setProfiles] = useStore('headersProfiles');
    const [isModelOpen, { open, close }] = useDisclosure(false);

    const handleAddProfile = (profile: THeadersProfile) => {
        close();
        setProfiles(addProfile(profiles, profile));
    };

    const handleChangeProfile = (profile: THeadersProfile): void => {
        setProfiles(changeProfile(profiles, profile));
    };

    const handleChangeProfileStatus = (id: string, status: THeaderStatus): void => {
        setProfiles(changeProfileStatus(profiles, id, status));
        showNotification({
            message: `Profile ${status}`,
            color: 'green',
        });
    };

    const handleDeleteProfile = (id: string): void => {
        setProfiles(deleteProfile(profiles, id));
        showNotification({
            message: 'Profile deleted',
            color: 'green',
        });
    };

    const handleChangeActiveProfile = (id: string): void => {
        setProfiles(setLastActive(profiles, id));
    };

    const activeProfileId = useMemo(() => {
        const arr = Object.values(profiles ?? {});
        if (arr.length === 0) {
            return '';
        }
        const lastActiveProfile = arr.find((p) => p.lastActive);
        return lastActiveProfile ? lastActiveProfile.id : arr[0].id;
    }, [profiles]);

    const activeProfile = useMemo(() => (profiles ?? {})[activeProfileId] ?? null, [activeProfileId, profiles]);

    return (
        <>
            <div className={styles.header}>
                <Flex direction="column">
                    <Text fz="md" fw={500}>
                        Request Headers
                    </Text>

                    {activeProfile && (
                        <Group spacing="0.3rem">
                            <Text fz="xs" c="dimmed">
                                {activeProfile.name}
                            </Text>

                            <Badge
                                size="xs"
                                variant="filled"
                                color={activeProfile.status === 'enabled' ? 'green' : 'gray'}
                            >
                                {activeProfile.status}
                            </Badge>
                        </Group>
                    )}
                </Flex>

                {profiles && activeProfile && (
                    <ProfilesActions
                        profiles={profiles}
                        activeProfile={activeProfile}
                        onChangeActive={handleChangeActiveProfile}
                        onDelete={handleDeleteProfile}
                        onStatusChange={handleChangeProfileStatus}
                        onAdd={open}
                    />
                )}
            </div>

            {profiles === null && <Spinner />}

            {profiles !== null && isEmpty(profiles) && (
                <NotFound
                    text="No profiles to show"
                    action={(
                        <Button
                            leftIcon={<IconPlaylistAdd size={20} />}
                            variant="gradient"
                            size="xs"
                            title="Add new profile"
                            gradient={{ from: 'indigo', to: 'cyan' }}
                            compact
                            onClick={open}
                        >
                            Add new profile
                        </Button>
                    )}
                />
            )}

            {activeProfile && (
                <Profile
                    profile={activeProfile}
                    onChange={handleChangeProfile}
                />
            )}

            <Modal
                opened={isModelOpen}
                overlayProps={overlaySettings}
                title="Add new profile"
                onClose={close}
            >
                <AddProfileForm onSubmit={handleAddProfile} />
            </Modal>
        </>
    );
};

export const Headers = memo(HeadersPage);
