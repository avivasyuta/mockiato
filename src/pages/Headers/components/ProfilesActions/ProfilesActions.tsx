import React, { FC, useMemo } from 'react';
import { Badge, Box, Button, Divider, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';
import { THeadersProfile } from '../../../../types';
import styles from './ProfilesActions.module.css';

interface ProfilesActionsProps {
    profiles: Record<string, THeadersProfile>
    activeProfile: THeadersProfile
    onChangeActive: (id: string) => void
}

export const ProfilesActions: FC<ProfilesActionsProps> = ({
    profiles,
    activeProfile,
    onChangeActive,
}) => {
    const profilesArray = useMemo(() => Object.values(profiles).filter((p) => p.id !== activeProfile.id), [profiles]);

    return (
        <Group gap="xs" align="center">
            <Menu
                shadow="md"
                position="bottom-end"
                styles={{
                    item: { fontSize: '0.75rem', padding: '0.5rem' },
                }}
            >
                {profilesArray.length === 0 ? (
                    <Group gap="xs">
                        <Divider orientation="vertical" />
                        <Text fz="sm">{activeProfile.name}</Text>
                        <Badge
                            variant="filled"
                            color={activeProfile.status === 'enabled' ? 'green' : 'gray'}
                            size="xs"
                        >
                            {activeProfile.status}
                        </Badge>
                    </Group>
                ) : (
                    <Group gap="0.1rem">
                        <Divider orientation="vertical" />
                        <Menu.Target>
                            <Button
                                variant="subtle"
                                size="compact-xs"
                                rightSection={<IconChevronDown size={14} />}
                                className={styles.profileBtn}
                            >
                                <Group gap="xs">
                                    <Text fz="sm">{activeProfile.name}</Text>
                                    <Badge
                                        variant="filled"
                                        color={activeProfile.status === 'enabled' ? 'green' : 'gray'}
                                        size="xs"
                                    >
                                        {activeProfile.status}
                                    </Badge>
                                </Group>
                            </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {profilesArray.map((p) => (
                                <Menu.Item
                                    key={p.id}
                                    p="0.35rem 0.5rem"
                                    onClick={() => onChangeActive(p.id)}
                                >
                                    <Group wrap="nowrap" gap="xs" justify="apart">
                                        <Box>{p.name}</Box>
                                        <Badge
                                            variant="filled"
                                            color={p.status === 'enabled' ? 'green' : 'gray'}
                                            size="xs"
                                        >
                                            {p.status}
                                        </Badge>
                                    </Group>
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Group>
                )}
            </Menu>
        </Group>
    );
};
