import React, { FC, useMemo } from 'react';
import {
    ActionIcon, Badge, Box, Group, Menu, SegmentedControl,
} from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { ProfileMenu } from './components/ProfileMenu';
import { ProfileLabel } from './components/ProfileLabel';
import { THeadersProfile, THeaderStatus } from '../../../../types';

const maxCount = 3;

interface ProfilesActionsProps {
    profiles: Record<string, THeadersProfile>
    activeProfile: THeadersProfile
    onChangeActive: (id: string) => void
    onDelete: (id: string) => void
    onStatusChange: (id: string, status: THeaderStatus) => void
    onAdd: () => void
}

export const ProfilesActions: FC<ProfilesActionsProps> = ({
    profiles,
    activeProfile,
    onChangeActive,
    onDelete,
    onStatusChange,
    onAdd,
}) => {
    const sortedProfiles = useMemo(() => {
        const array = Object.values(profiles);

        if (array.length <= maxCount) {
            return array;
        }

        const activeIndex = array.findIndex((p) => p.id === activeProfile.id);
        if (activeIndex >= array.length - maxCount) {
            return array;
        }

        return [
            ...array.slice(0, activeIndex),
            ...array.slice(activeIndex + 1),
            array[activeIndex],
        ];
    }, [profiles]);

    const segmentControlData = useMemo(() => {
        let slice = sortedProfiles;
        if (sortedProfiles.length > maxCount) {
            slice = sortedProfiles.slice(sortedProfiles.length - maxCount);
        }

        return slice.map((p) => ({
            label: <ProfileLabel name={p.name} status={p.status} />,
            value: p.id,
        }));
    }, [sortedProfiles]);

    const extraMenuData = useMemo(() => {
        if (sortedProfiles.length <= maxCount) {
            return [];
        }

        // Get only last 3 items
        return sortedProfiles.slice(0, sortedProfiles.length - maxCount).reverse();
    }, [sortedProfiles]);

    return (
        <Group spacing="0.2rem" align="center">
            {extraMenuData.length > 0 && (
                <Menu
                    shadow="md"
                    position="bottom-end"
                    styles={{
                        item: { fontSize: '0.75rem', padding: '0.5rem' },
                    }}
                >
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            radius="sm"
                        >
                            <IconChevronDown size={14} />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        {extraMenuData.map((p) => (
                            <Menu.Item p="0.35rem 0.5rem" onClick={() => onChangeActive(p.id)}>
                                <Group noWrap spacing="xs" position="apart">
                                    <Box>{p.name}</Box>
                                    <Badge
                                        color={p.status === 'enabled' ? 'green' : 'gray'}
                                        size="xs"
                                    >
                                        {p.status}
                                    </Badge>
                                </Group>
                            </Menu.Item>
                        ))}
                    </Menu.Dropdown>
                </Menu>
            )}

            <SegmentedControl
                size="xs"
                color="blue"
                data={segmentControlData}
                value={activeProfile.id}
                onChange={onChangeActive}
            />

            {activeProfile && (
                <ProfileMenu
                    id={activeProfile.id}
                    name={activeProfile.name}
                    status={activeProfile.status}
                    onAdd={onAdd}
                    onDelete={onDelete}
                    onChangeStatus={onStatusChange}
                />
            )}
        </Group>
    );
};
