import React, { FC } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { ProfilesActions } from '../ProfilesActions';
import { Header } from '../../../../components/Header';
import { THeader, THeadersProfile, THeaderStatus } from '../../../../types';
import { changeProfileStatus, deleteProfile, setLastActive } from '../../helpers';
import { ProfileMenu } from '../ProfilesActions/components/ProfileMenu';

interface TopPanelProps {
    activeProfile: THeadersProfile
    profiles: Record<string, THeadersProfile>
    setProfiles: (val: Record<string, THeadersProfile>) => void
    onHeaderAdd: (header: THeader) => void
    onProfileAdd: () => void
}

export const TopPanel: FC<TopPanelProps> = (props) => {
    const { profiles, activeProfile, setProfiles, onHeaderAdd, onProfileAdd } = props;

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

    const handleAddHeader = () => {
        onHeaderAdd({
            id: nanoid(),
            key: '',
            value: '',
            type: 'request',
            isActive: true,
        });
    };

    return (
        <Header>
            <Group spacing="sm">
                <Text fz="sm" fw={500}>
                    Request Headers
                </Text>

                {activeProfile && (
                    <ProfilesActions
                        profiles={profiles}
                        activeProfile={activeProfile}
                        onChangeActive={handleChangeActiveProfile}
                    />
                )}
            </Group>

            {activeProfile && (
                <Group spacing="xs">
                    <Button
                        leftIcon={<IconPlaylistAdd size={20} />}
                        variant="gradient"
                        size="xs"
                        title="Add new header"
                        gradient={{ from: 'indigo', to: 'cyan' }}
                        compact
                        onClick={handleAddHeader}
                    >
                        Add new header
                    </Button>

                    <ProfileMenu
                        id={activeProfile.id}
                        name={activeProfile.name}
                        status={activeProfile.status}
                        onAdd={onProfileAdd}
                        onDelete={handleDeleteProfile}
                        onChangeStatus={handleChangeProfileStatus}
                    />
                </Group>
            )}
        </Header>
    );
};
