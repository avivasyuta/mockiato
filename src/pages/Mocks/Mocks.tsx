import React, { memo, useCallback, useReducer } from 'react';
import {
    Button,
    Drawer,
    Title,
    useMantineTheme,
} from '@mantine/core';
import { IconCheck, IconPlaylistAdd } from '@tabler/icons-react';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { useStore } from '../../hooks/useStore';
import { TMock, TMockFormAction, TMockFormState } from '../../types';
import { NotFound } from '../../components/NotFound';
import { MockForm } from '../../components/MockForm';
import { trimHeaders } from '../../components/MockForm/utils';
import { Spinner } from '../../components/Spinner';
import { Mock } from './components/Mock';
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
    const theme = useMantineTheme();

    const handleCopyMock = (mock: TMock): void => {
        dispatchMockForm({
            type: 'open',
            payload: {
                ...mock,
                id: nanoid(),
            },
        });
    };

    const handleOpenMockForm = useCallback(() => {
        dispatchMockForm({ type: 'open' });
    }, []);

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
            icon: <IconCheck size={18} />,
            color: 'green',
        });
    };

    const handleChangeMock = (newMock: TMock): void => {
        const newMocks = mocks.map((mock) => (mock.id === newMock.id ? newMock : mock));
        setMocks(newMocks);
    };

    const handleCloseForm = (): void => {
        dispatchMockForm({ type: 'close' });
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
            title: 'You deal great',
            message: 'Mock data was saved',
            icon: <IconCheck size={18} />,
            color: 'green',
        });

        handleCloseForm();
    };

    return (
        <>
            <div className={styles.header}>
                <Title order={4}>Response mocks</Title>

                <Button
                    leftIcon={<IconPlaylistAdd size={20} />}
                    variant="gradient"
                    size="xs"
                    title="Add new mock"
                    gradient={{ from: 'indigo', to: 'cyan' }}
                    onClick={handleOpenMockForm}
                >
                    Add new mock
                </Button>
            </div>

            <div className={styles.c}>
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
            </div>

            <Drawer
                opened={mockForm.isOpened}
                padding="sm"
                position="right"
                size="50%"
                title={mockForm.mock?.id ? 'Edit mock' : 'Add new mock'}
                className={styles.drawer}
                overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[1]}
                overlayOpacity={0.2}
                overlayBlur={2}
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
