import React, { FC, useEffect } from 'react';
import { ActionIcon, Collapse, Group, Menu, Text } from '@mantine/core';
import {
    IconChevronDown,
    IconChevronUp,
    IconCircleOff,
    IconDotsVertical,
    IconPower,
    IconTrash,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { TMock, TMockGroup } from '../../../../../../types';
import styles from './MockGroup.module.css';

type MockGroupProps = React.PropsWithChildren & {
    group: TMockGroup;
    mocks?: TMock[];
    isExpanded?: boolean;
    onToggleGroup?: (isExpanded: boolean) => void;
    onDeleteGroup: (group: TMockGroup) => void;
    onRemoveMocks?: (group: TMockGroup) => void;
    onDisableAll?: (group: TMockGroup) => void;
    onEnableAll?: (group: TMockGroup) => void;
};

export const MockGroup: FC<MockGroupProps> = ({
    group,
    children,
    mocks = [],
    isExpanded = true,
    onToggleGroup,
    onDeleteGroup,
    onRemoveMocks,
    onEnableAll,
    onDisableAll,
}) => {
    const [isOpen, { toggle, open, close }] = useDisclosure(true);

    // Sync the internal state with the external isExpanded prop
    useEffect(() => {
        if (isExpanded) {
            open();
        } else {
            close();
        }
    }, [isExpanded, open, close]);

    const handleToggle = () => {
        toggle();
        // Notify parent component about the state change
        if (onToggleGroup) {
            onToggleGroup(!isOpen);
        }
    };

    const handleRemoveMocks = () => {
        onRemoveMocks?.(group);
    };

    const handleEnableAll = () => {
        onEnableAll?.(group);
    };

    const handleDisableAll = () => {
        onDisableAll?.(group);
    };

    const allEnabled = mocks.every((item) => item.isActive);
    const allDisabled = mocks.every((item) => !item.isActive);

    return (
        <div className={styles.root}>
            <Group justify="space-between">
                <Group gap="0">
                    {children ? (
                        <Text
                            ml="xs"
                            className={styles.groupName}
                            onClick={handleToggle}
                        >
                            {group.name} {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                        </Text>
                    ) : (
                        <Text ml="xs">{group.name}</Text>
                    )}
                </Group>

                <Menu
                    withinPortal
                    position="bottom-end"
                    shadow="sm"
                >
                    <Menu.Target>
                        <ActionIcon
                            variant="subtle"
                            color="gray"
                        >
                            <IconDotsVertical size={14} />
                        </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                        {mocks.length > 0 && (
                            <>
                                <Menu.Item
                                    leftSection={<IconPower size={14} />}
                                    disabled={allEnabled}
                                    onClick={handleEnableAll}
                                >
                                    Enable all
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconCircleOff size={12} />}
                                    disabled={allDisabled}
                                    onClick={handleDisableAll}
                                >
                                    Disable all
                                </Menu.Item>

                                <Menu.Divider />
                                <Menu.Label>Danger zone</Menu.Label>

                                <Menu.Item
                                    leftSection={<IconTrash size={12} />}
                                    color="red"
                                    onClick={handleRemoveMocks}
                                >
                                    Remove mocks from group
                                </Menu.Item>
                            </>
                        )}

                        <Menu.Item
                            leftSection={<IconTrash size={12} />}
                            color="red"
                            onClick={() => onDeleteGroup(group)}
                        >
                            Delete group
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            {children && (
                <Collapse in={isOpen}>
                    <div className={styles.content}>{children}</div>
                </Collapse>
            )}
        </div>
    );
};
