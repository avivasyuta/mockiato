import React, { FC, useState } from 'react';
import { ActionIcon, Button, Group, Menu, Modal, Text } from '@mantine/core';
import { IconDotsVertical, IconPlus, IconSelectAll, IconUpload } from '@tabler/icons-react';
import { TMock, TMockGroup } from '~/types';
import { Header } from '~/components/Header';
import { iconSize, overlaySettings } from '~/contstant';
import { ExportAction } from './components/ExportAction';
import { type ImportMocksProps, ImportMocksForm } from './components/ImportMocksForm';
import { AddGroupForm } from './components/AddGroupForm';

type TopPanelProps = {
    groups: TMockGroup[];
    mocks: TMock[];
    onMockAdd: () => void;
    onGroupAdd: (group: TMockGroup) => void;
    onMocksImportSuccess: ImportMocksProps['onSuccess'];
};

type ModalType = 'newGroup' | 'import' | null;

export const TopPanel: FC<TopPanelProps> = ({ groups, mocks, onMockAdd, onGroupAdd, onMocksImportSuccess }) => {
    const [modalContentType, setModalContentType] = useState<ModalType>(null);
    const [modalTitle, setModalTitle] = useState<string>('');

    const handleAddGroup = (group: TMockGroup) => {
        onGroupAdd(group);
        setModalContentType(null);
        setModalTitle('');
    };

    const handleImportMocks: ImportMocksProps['onSuccess'] = (newMocks, newGroups) => {
        onMocksImportSuccess(newMocks, newGroups);
    };

    const getModalContent = () => {
        switch (modalContentType) {
            case 'import':
                return <ImportMocksForm onSuccess={handleImportMocks} />;
            case 'newGroup':
                return (
                    <AddGroupForm
                        groups={groups}
                        onAdd={handleAddGroup}
                    />
                );
            default:
                return null;
        }
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
                            onClick={() => {
                                setModalContentType('newGroup');
                                setModalTitle('Add new group');
                            }}
                        >
                            Add new group
                        </Menu.Item>

                        <Menu.Item
                            leftSection={<IconUpload size={iconSize} />}
                            onClick={() => {
                                setModalContentType('import');
                                setModalTitle('Import mocks');
                            }}
                        >
                            Import mocks
                        </Menu.Item>

                        <ExportAction
                            mocks={mocks}
                            groups={groups}
                        />
                    </Menu.Dropdown>
                </Menu>

                <Modal
                    opened={modalContentType !== null}
                    overlayProps={overlaySettings}
                    title={modalTitle}
                    size={modalContentType === 'import' ? 'xl' : 'md'}
                    onClose={() => setModalContentType(null)}
                >
                    {getModalContent()}
                </Modal>
            </Group>
        </Header>
    );
};
