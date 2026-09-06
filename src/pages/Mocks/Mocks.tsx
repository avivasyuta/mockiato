import React, { memo, useReducer, useState, useMemo, useEffect, useCallback } from 'react';
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

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
}

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
    const [expandedMocks, setExpandedMocks] = useState<Set<string>>(new Set());

    // Initialize expanded groups when groups are loaded
    useEffect(() => {
        if (groups && groups.length > 0) {
            setExpandedGroups(new Set(groups.map((group) => group.id)));
        }
    }, [groups]);

    // Calculate areAllExpanded based on actual group and mock states
    const areAllExpanded = useMemo(() => {
        const groupList = groups ?? [];
        const mockList = mocks ?? [];
        if (groupList.length === 0 && mockList.length === 0) return false;

        const allGroupsExpanded = groupList.every((group) => expandedGroups.has(group.id));
        const allMocksExpanded = mockList.every((mock) => expandedMocks.has(mock.id));
        return allGroupsExpanded && allMocksExpanded;
    }, [groups, mocks, expandedGroups, expandedMocks]);

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
        setExpandedGroups((prev) => new Set([...prev, group.id]));
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

    const handleUpdateMocks = useCallback(
        (newMocks: TMock[]) => {
            setMocks(newMocks);
        },
        [setMocks],
    );

    const handleReorderGroups = useCallback(
        (activeId: string, overId: string) => {
            if (!groups) return;

            const oldIndex = groups.findIndex((g) => g.id === activeId);
            const newIndex = groups.findIndex((g) => g.id === overId);

            if (oldIndex === -1 || newIndex === -1) return;

            setGroups(arrayMove(groups, oldIndex, newIndex));
        },
        [groups, setGroups],
    );

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

    const handleToggleAll = () => {
        if (areAllExpanded) {
            // Collapse all groups and mocks
            setExpandedGroups(new Set());
            setExpandedMocks(new Set());
        } else {
            // Expand all groups and mocks
            setExpandedGroups(new Set(groups?.map((group) => group.id) || []));
            setExpandedMocks(new Set(mocks?.map((mock) => mock.id) || []));
        }
    };

    const handleToggleGroup = (groupId: string, isExpanded: boolean) => {
        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(groupId);
            } else {
                newSet.delete(groupId);
            }
            return newSet;
        });
    };

    const handleToggleMock = (mockId: string, isExpanded: boolean) => {
        setExpandedMocks((prev) => {
            const newSet = new Set(prev);
            if (isExpanded) {
                newSet.add(mockId);
            } else {
                newSet.delete(mockId);
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

    const handleImportMocks = async (importedMocks: TMock[], importedGroups: TMockGroup[]) => {
        const newMocks = mergeMocks(mocks, importedMocks);
        const newGroups = mergeGroups(groups, importedGroups);

        // Groups must be persisted before mocks.
        await setGroups(newGroups);
        await setMocks(newMocks);

        setExpandedGroups((prev) => {
            const newSet = new Set(prev);
            importedGroups.forEach((group) => {
                newSet.add(group.id);
            });
            return newSet;
        });

        showNotification({
            message: 'Mocks have been successfully imported',
            color: 'green',
        });
    };

    return (
        <>
            <TopPanel
                groups={groups}
                mocks={mocks}
                areAllExpanded={areAllExpanded}
                onToggleAll={handleToggleAll}
                onMockAdd={handleOpenForm}
                onGroupAdd={handleAddGroup}
                onMocksImportSuccess={handleImportMocks}
            />

            {mocks.length > 0 || groups.length > 0 ? (
                <Content
                    mocks={mocks}
                    groups={groups}
                    expandedGroups={expandedGroups}
                    expandedMocks={expandedMocks}
                    onToggleGroup={handleToggleGroup}
                    onToggleMock={handleToggleMock}
                    onDeleteMock={handleDeleteMock}
                    onChangeMock={handleChangeMock}
                    onEditMock={handleEditMock}
                    onCopyMock={handleCopyMock}
                    onDeleteGroup={handleDeleteGroup}
                    onClearGroup={handleClearGroup}
                    onToggleMocks={handleToggleMocksInGroup}
                    onReorderGroups={handleReorderGroups}
                    onUpdateMocks={handleUpdateMocks}
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
