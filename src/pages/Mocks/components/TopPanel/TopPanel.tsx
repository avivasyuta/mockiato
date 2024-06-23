import React, { FC } from 'react';
import { ActionIcon, Button, Group, Menu, Modal, Text } from '@mantine/core';
import { IconDotsVertical, IconPlus, IconSelectAll } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { iconSize, overlaySettings } from '~/contstant';
import { TMockGroup } from '~/types';
import { Header } from '~/components/Header';
import { AddGroupForm } from '../AddGroupForm';

type TopPanelProps = {
    groups: TMockGroup[];
    onMockAdd: () => void;
    onGroupAdd: (group: TMockGroup) => void;
};

export const TopPanel: FC<TopPanelProps> = ({ groups, onMockAdd, onGroupAdd }) => {
    const [isGroupModalOpen, groupModalActions] = useDisclosure(false);

    const handleAddGroup = (group: TMockGroup) => {
        onGroupAdd(group);
        groupModalActions.close();
    };

    return (
        <Header
            title={
                <Text
                    fz="sm"
                    fw={500}
                >
                    Response Mocks
                </Text>
            }
        >
            <Group gap="xs">
                <Button
                    leftSection={<IconPlus size={16} />}
                    size="compact-xs"
                    title="Add new mock"
                    onClick={onMockAdd}
                >
                    Add Mock
                </Button>

                <Menu
                    shadow="md"
                    width={200}
                    position="bottom-end"
                    styles={{
                        item: {
                            fontSize: '0.75rem',
                            padding: '0.5rem',
                        },
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
                            leftSection={<IconSelectAll size={iconSize} />}
                            onClick={groupModalActions.open}
                        >
                            Add new group
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>

            <Modal
                opened={isGroupModalOpen}
                overlayProps={overlaySettings}
                title="Add new group"
                onClose={groupModalActions.close}
            >
                <AddGroupForm
                    groups={groups}
                    onAdd={handleAddGroup}
                />
            </Modal>
        </Header>
    );
};
