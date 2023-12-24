import React, { memo, useReducer } from 'react';
import { Drawer } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { useStore } from '../../hooks/useStore';
import { TMock, TMockGroup } from '../../types';
import { NotFound } from '../../components/NotFound';
import { MockForm } from '../../components/MockForm';
import { trimHeaders } from '../../components/MockForm/utils';
import { Spinner } from '../../components/Spinner';
import { overlaySettings } from '../../contstant';
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
    const [mocks, setMocks] = useStore('mocks', []);
    const [groups, setGroups] = useStore('mockGroups', []);

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

    if (!mocks) {
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

    return (
        <>
            <TopPanel
                groups={groups}
                onMockAdd={handleOpenForm}
                onGroupAdd={handleAddGroup}
            />
            {mocks.length > 0 || groups.length > 0 ? (
                <Content
                    mocks={mocks}
                    groups={groups}
                    onDeleteMock={handleDeleteMock}
                    onChangeMock={handleChangeMock}
                    onEditMock={handleEditMock}
                    onCopyMock={handleCopyMock}
                    onDeleteGroup={handleDeleteGroup}
                    onClearGroup={handleClearGroup}
                />
            ) : (
                <NotFound text="No mocks to show" />
            )}

            <Drawer
                opened={mockForm.isOpened}
                padding="sm"
                position="right"
                size="50%"
                title={mockForm.mock?.id ? 'Edit mock' : 'Add new mock'}
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
