import React, { FC } from 'react';
import { ActionIcon, Collapse, Group, Menu, Text } from '@mantine/core';
import {
    IconChevronDown,
    IconChevronRight,
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
    onDeleteGroup: (group: TMockGroup) => void;
    onRemoveMocks?: (group: TMockGroup) => void;
    onDisableAll?: (group: TMockGroup) => void;
    onEnableAll?: (group: TMockGroup) => void;
};

export const MockGroup: FC<MockGroupProps> = ({
    group,
    children,
    mocks = [],
    onDeleteGroup,
    onRemoveMocks,
    onEnableAll,
    onDisableAll,
}) => {
    const [isOpen, { toggle }] = useDisclosure(true);

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

    console.log('--- group', group.name);
    console.log('allEnabled', allEnabled);
    console.log('allDisabled', allDisabled);
    console.log('mocks', mocks);
    console.log('--- group', group.name);

    return (
        <div className={styles.root}>
            <Group justify="space-between">
                <Group gap="0">
                    {children && (
                        <ActionIcon
                            variant="subtle"
                            onClick={toggle}
                        >
                            {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
                        </ActionIcon>
                    )}

                    <Text ml="xs">{group.name}</Text>
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
