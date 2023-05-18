import React, { memo, useReducer } from 'react';
import { Button, Drawer, Text } from '@mantine/core';
import { IconPlaylistAdd } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { useStore } from '../../hooks/useStore';
import { TMock } from '../../types';
import { NotFound } from '../../components/NotFound';
import { MockForm } from '../../components/MockForm';
import { trimHeaders } from '../../components/MockForm/utils';
import { Spinner } from '../../components/Spinner';
import { overlaySettings } from '../../contstant';
import { Mock } from './components/Mock';
import { TMockFormAction, TMockFormState } from './types';
import styles from './Mocks.module.css';

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

    const handleCopyMock = (mock: TMock): void => {
        dispatchMockForm({
            type: 'open',
            payload: {
                ...mock,
                id: nanoid(),
            },
        });
    };

    const handleOpenForm = () => {
        dispatchMockForm({ type: 'open' });
    };

    const handleCloseForm = (): void => {
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

    const handleDeleteMock = (mockId?: string) => {
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
            <div className={styles.header}>
                <Text fz="md" fw={500}>Requests mocks</Text>

                <Button
                    leftIcon={<IconPlaylistAdd size={20} />}
                    size="xs"
                    title="Add new mock"
                    compact
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan' }}
                    onClick={handleOpenForm}
                >
                    Add new mock
                </Button>
            </div>

            {mocks.length > 0 ? (
                <div className={styles.mocks}>
                    {mocks.map((mock: TMock) => (
                        <Mock
                            key={mock.id}
                            mock={mock}
                            onEditClick={handleEditMock}
                            onCopyClick={handleCopyMock}
                            onDelete={handleDeleteMock}
                            onChange={handleChangeMock}
                        />
                    ))}
                </div>
            ) : (
                <NotFound text="No mocks to show" />
            )}

            <Drawer
                opened={mockForm.isOpened}
                padding="sm"
                position="right"
                size="50%"
                title={mockForm.mock?.id ? 'Edit mock' : 'Add new mock'}
                className={styles.drawer}
                overlayProps={overlaySettings}
                styles={{
                    content: { display: 'flex', flexDirection: 'column' },
                    body: { display: 'flex', flex: 1 },
                }}
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
