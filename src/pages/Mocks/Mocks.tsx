import React, { memo, useReducer, useState, useMemo, useEffect } from 'react';
import { Drawer } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { useStore } from '~/hooks/useStore';
import { TMock, TMockGroup } from '~/types';
import { NotFound } from '~/components/NotFound';
import { trimHeaders } from '~/pages/Mocks/components/MockForm/utils';
import { Spinner } from '~/components/Spinner';
import { overlaySettings } from '~/contstant';
import { mergeGroups } from '~/utils/mergeGroups';
import { mergeMocks } from '~/utils/mergeMocks';
import { MockForm } from './components/MockForm';
import { TMockFormAction, TMockFormState } from './types';
import { TopPanel } from './components/TopPanel';
import { Content } from './components/Content';

const initialMockFormState: TMockFormState = {
    isOpened: false,
    mock: undefined,
};

const mockFormReducer = (state: TMockFormState, action: TMockFormAction): TMockFormState => {
    switch (action.type) {
        case 'open':
            return { isOpened: true, mock: action.payload };
        case 'close':
            return { isOpened: false, mock: undefined };
        default:
            return state;
    }
};

const MocksPage: React.FC = () => {
    const [mockForm, dispatchMockForm] = useReducer(mockFormReducer, initialMockFormState);
    const [mocks, setMocks] = useStore('mocks');
    const [groups, setGroups] = useStore('mockGroups');
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

    // Initialize expanded groups when groups are loaded
    useEffect(() => {
        if (groups && groups.length > 0) {
            setExpandedGroups(new Set(groups.map(group => group.id)));
        }
    }, [groups]);

    // Calculate areAllGroupsExpanded based on actual group states
    const areAllGroupsExpanded = useMemo(() => {
        if (!groups || groups.length === 0) return false;
        return groups.every(group => expandedGroups.has(group.id));
    }, [groups, expandedGroups]);

    const handleCopyMock = (mock: TMock) => {
        dispatchMockForm({
            type: 'open',
            payload: {
                ...mock,
                id: nanoid(),
            },
        });
    };

    const handleAddGroup = (group: TMockGroup) => {
        setGroups([...(groups ?? []), group]);
        // Expand newly added group
        setExpandedGroups(prev => new Set([...prev, group.id]));
    };

    const handleOpenForm = () => {
        dispatchMockForm({ type: 'open' });
    };

    const handleCloseForm = () => {
        dispatchMockForm({ type: 'close' });
    };

    const handleEditMock = (mock: TMock) => {
        dispatchMockForm({
            type: 'open',
            payload: mock,
        });
    };

    if (!mocks || !groups) {
        return <Spinner />;
    }

    const handleDeleteMock = (mockId: string) => {
        const newMocks = mocks.filter((m) => mockId !== m.id);

        setMocks(newMocks);
        showNotification({
            message: 'Mock was deleted',
            color: 'green',
        });
    };

    const handleChangeMock = (newMock: TMock): void => {
        const newMocks = mocks.map((mock) => (mock.id === newMock.id ? newMock : mock));
        setMocks(newMocks);
    };

    const handleDeleteGroup = async (groupId: TMockGroup['id']) => {
        const newGroups = groups.filter((group) => group.id !== groupId);
        const newMocks = mocks.filter((mock) => mock.groupId !== groupId);
        await setMocks(newMocks);
        await setGroups(newGroups);
    };

    const handleClearGroup = async (groupId: TMockGroup['id']) => {
        const newMocks = mocks.map((mock) => {
            const newMock = { ...mock };
            if (mock.groupId === groupId) {
                delete newMock.groupId;
            }
            return newMock;
        });

        await setMocks(newMocks);
    };

    const handleToggleMocksInGroup = async (groupId: string, status: boolean) => {
        const newMocks = mocks.map((mock) => {
            const newMock = { ...mock };
            if (mock.groupId === groupId) {
                newMock.isActive = status;
            }
            return newMock;
        });

        await setMocks(newMocks);
    };

    const handleToggleAllGroups = () => {
        if (areAllGroupsExpanded) {
            // Collapse all groups
            setExpandedGroups(new Set());
        } else {
            // Expand all groups
            setExpandedGroups(new Set(groups?.map(group => group.id) || []));
        }
    };

    const handleToggleGroup = (groupId: string, isExpanded: boolean) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(groupId);
            } else {
                newSet.delete(groupId);
            }
            return newSet;
        });
    };

    const submitForm = (values: TMock): void => {
        const mock = trimHeaders(values);
        const isNew = !mocks.find((m) => m.id === mock.id);

        if (isNew) {
            setMocks([mock, ...mocks]);
        } else {
            const newMocks = mocks.map((m) => {
                if (m.id === mock.id) {
                    return mock;
                }
                return m;
            });

            setMocks(newMocks);
        }

        showNotification({
            message: 'Mock data was saved',
            color: 'green',
        });

        handleCloseForm();
    };

    const handleImportMocks = (importedMocks: TMock[], importedGroups: TMockGroup[]) => {
        const newMocks = mergeMocks(mocks, importedMocks);
        const newGroups = mergeGroups(groups, importedGroups);

        setGroups(newGroups);

        // Expand newly imported groups
        setExpandedGroups(prev => {
            const newSet = new Set(prev);
            importedGroups.forEach(group => {
                newSet.add(group.id);
            });
            return newSet;
        });

        setTimeout(() => {
            setMocks(newMocks);

            showNotification({
                message: 'Mocks have been successfully imported',
                color: 'green',
            });
        }, 0);
    };

    return (
        <>
            <TopPanel
                groups={groups}
                mocks={mocks}
                areAllGroupsExpanded={areAllGroupsExpanded}
                onToggleAllGroups={handleToggleAllGroups}
                onMockAdd={handleOpenForm}
                onGroupAdd={handleAddGroup}
                onMocksImportSuccess={handleImportMocks}
            />

            {mocks.length > 0 || groups.length > 0 ? (
                <Content
                    mocks={mocks}
                    groups={groups}
                    expandedGroups={expandedGroups}
                    onToggleGroup={handleToggleGroup}
                    onDeleteMock={handleDeleteMock}
                    onChangeMock={handleChangeMock}
                    onEditMock={handleEditMock}
                    onCopyMock={handleCopyMock}
                    onDeleteGroup={handleDeleteGroup}
                    onClearGroup={handleClearGroup}
                    onToggleMocks={handleToggleMocksInGroup}
                />
            ) : (
                <NotFound text="No mocks to show" />
            )}

            <Drawer
                opened={mockForm.isOpened}
                padding="sm"
                position="right"
                size="50%"
                withCloseButton={false}
                overlayProps={overlaySettings}
                styles={{
                    content: { display: 'flex', flexDirection: 'column' },
                    body: { display: 'flex', flex: 1 },
                }}
                offset={8}
                radius="md"
                onClose={handleCloseForm}
            >
                {mockForm.isOpened && (
                    <MockForm
                        mock={mockForm.mock}
                        onClose={handleCloseForm}
                        onSubmit={submitForm}
                    />
                )}
            </Drawer>
        </>
    );
};

export const Mocks = memo(MocksPage);
