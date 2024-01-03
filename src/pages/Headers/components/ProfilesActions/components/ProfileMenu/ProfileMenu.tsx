import React, { FC } from 'react';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconUserPlus, IconTrash, IconUser, IconUserOff } from '@tabler/icons-react';
import { THeadersProfile, THeaderStatus } from '~/types';
import { iconSize } from '~/contstant';

type ProfileMenuProps = Omit<THeadersProfile, 'headers' | 'lastActive'> & {
    onAdd: () => void;
    onDelete: (id: string) => void;
    onChangeStatus: (id: string, status: THeaderStatus) => void;
};

export const ProfileMenu: FC<ProfileMenuProps> = ({ id, name, status, onAdd, onDelete, onChangeStatus }) => {
    const handleDelete = (): void => {
        modals.openConfirmModal({
            title: `Delete headers profile «${name}»`,
            children: (
                <Text size="sm">
                    Are you sure you want to delete this profile? This action will remove all settings for headers.
                </Text>
            ),
            labels: { confirm: 'Delete', cancel: 'Cancel' },
            confirmProps: { color: 'red', size: 'xs' },
            cancelProps: {
                size: 'xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => onDelete(id),
        });
    };

    const handleChangeStatus = (): void => {
        const newStatus: THeaderStatus = status === 'enabled' ? 'disabled' : 'enabled';
        onChangeStatus(id, newStatus);
    };

    return (
        <Menu
            shadow="md"
            width={200}
            position="bottom-end"
            styles={{
                item: { fontSize: '0.75rem', padding: '0.5rem' },
            }}
        >
            <Menu.Target>
                <ActionIcon
                    variant="default"
                    color="blue"
                    size="sm"
                    radius="sm"
                >
                    <IconDotsVertical size={14} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconUserPlus size={iconSize} />}
                    onClick={onAdd}
                >
                    Add new profile
                </Menu.Item>

                <Menu.Item
                    leftSection={status === 'enabled' ? <IconUserOff size={iconSize} /> : <IconUser size={iconSize} />}
                    onClick={handleChangeStatus}
                >
                    {status === 'enabled' ? 'Disable' : 'Enable'} profile
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item
                    color="red"
                    leftSection={<IconTrash size={14} />}
                    onClick={handleDelete}
                >
                    Delete profile
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};
