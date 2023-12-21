import React, { FC } from 'react';
import { ActionIcon, Collapse, Group, Menu, Text } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconDots, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { TMockGroup } from '../../../../../../types';
import styles from './MockGroup.module.css';

type MockGroupProps = React.PropsWithChildren & {
    group: TMockGroup
    hasMocks?: boolean
    onDeleteGroup: (group: TMockGroup) => void
    onRemoveMocks?: (group: TMockGroup) => void
    onDeleteMocks?: (group: TMockGroup) => void
}

export const MockGroup: FC<MockGroupProps> = ({
    group,
    children,
    hasMocks = false,
    onDeleteGroup,
    onRemoveMocks,
    onDeleteMocks,
}) => {
    const [isOpen, { toggle }] = useDisclosure(true);

    const handleRemoveMocks = () => {
        onRemoveMocks?.(group);
    };

    const handleDeleteMocks = () => {
        onDeleteMocks?.(group);
    };

    return (
        <div className={styles.root}>
            <Group justify="space-between">
                <Group gap="0">
                    {children && (
                        <ActionIcon
                            variant="subtle"
                            onClick={toggle}
                        >
                            {isOpen ? (
                                <IconChevronDown size={14} />
                            ) : (
                                <IconChevronRight size={14} />
                            )}
                        </ActionIcon>
                    )}

                    <Text ml="sm">{group.name}</Text>
                </Group>

                <Menu withinPortal position="bottom-end" shadow="sm">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDots size={14} />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        {hasMocks && (
                            <>
                                <Menu.Item
                                    leftSection={<IconTrash size={12} />}
                                    onClick={handleRemoveMocks}
                                >
                                    Remove mocks from group
                                </Menu.Item>

                                <Menu.Divider />
                                <Menu.Label>Danger zone</Menu.Label>
                            </>
                        )}

                        <Menu.Item
                            leftSection={<IconTrash size={12} />}
                            color="red"
                            onClick={() => onDeleteGroup(group)}
                        >
                            Delete group
                        </Menu.Item>

                        {hasMocks && (
                            <Menu.Item
                                leftSection={<IconTrash size={12} />}
                                color="red"
                                onClick={handleDeleteMocks}
                            >
                                Delete all mocks
                            </Menu.Item>
                        )}
                    </Menu.Dropdown>
                </Menu>
            </Group>

            {children && (
                <Collapse in={isOpen}>
                    <div className={styles.content}>
                        {children}
                    </div>
                </Collapse>
            )}
        </div>
    );
};
