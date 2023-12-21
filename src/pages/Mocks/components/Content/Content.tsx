import React, { FC } from 'react';
import { Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useMocks } from '../../../../hooks/useMocks';
import { Mock } from './components/Mock';
import { TMock, TMockGroup } from '../../../../types';
import { MockGroup } from './components/MockGroup';
import styles from './Content.module.css';

type ContentProps = {
    onDeleteMock: (mockId: string) => void
    onChangeMock: (newMock: TMock) => void
    onEditMock: (mock: TMock) => void
    onCopyMock: (mock: TMock) => void
}

export const Content: FC<ContentProps> = ({
    onCopyMock,
    onDeleteMock,
    onChangeMock,
    onEditMock,
}) => {
    const {
        mocksByGroups,
        emptyMocks,
        emptyGroups,
        mocks,
        groups,
        setMocks,
        setGroups,
    } = useMocks();

    const deleteMocksByGroup = (groupId: TMockGroup['id']) => {
        const newMocks = mocks.filter((mock) => mock.groupId !== groupId);
        setMocks(newMocks);
    };

    const handleDeleteMocks = (group: TMockGroup) => {
        modals.openConfirmModal({
            title: 'Delete mocks in group',
            children: (
                <Text size="sm">
                    Are you sure you want to delete all mocks in group «{group.name}»?
                </Text>
            ),
            labels: {
                confirm: 'Delete',
                cancel: 'Cancel',
            },
            confirmProps: {
                color: 'red',
                size: 'compact-xs',
            },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => deleteMocksByGroup(group.id),
        });
    };

    const deleteGroup = (groupId: TMockGroup['id']) => {
        const newGroups = groups.filter((group) => group.id !== groupId);
        setGroups(newGroups);
        deleteMocksByGroup(groupId);
    };

    const handleDeleteGroup = (group: TMockGroup) => {
        modals.openConfirmModal({
            title: 'Delete group',
            children: (
                <Text size="sm">
                    Are you sure you want to delete group «{group.name}» and all mocks in it?
                </Text>
            ),
            labels: {
                confirm: 'Delete',
                cancel: 'Cancel',
            },
            confirmProps: {
                color: 'red',
                size: 'compact-xs',
            },
            cancelProps: {
                size: 'compact-xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => deleteGroup(group.id),
        });
    };

    const handleRemoveMocks = (group: TMockGroup) => {
        const newMocks = mocks.map((mock) => {
            const newMock = { ...mock };
            if (mock.groupId === group.id) {
                delete newMock.groupId;
            }
            return newMock;
        });

        setMocks(newMocks);
    };

    return (
        <Stack gap="xl">
            <Stack gap="xs">
                {Object.values(mocksByGroups)
                    .map((value) => (
                        <MockGroup
                            key={value.group.id}
                            group={value.group}
                            hasMocks={mocks.length > 0}
                            onDeleteGroup={handleDeleteGroup}
                            onRemoveMocks={handleRemoveMocks}
                            onDeleteMocks={handleDeleteMocks}
                        >
                            <>
                                <div className={styles.tableHeader}>
                                    <Text size="xs" c="dimmed" className={styles.status}> </Text>
                                    <Text size="xs" c="dimmed" className={styles.method}>Method</Text>
                                    <Text size="xs" c="dimmed" className={styles.url}>URL</Text>
                                    <Text size="xs" c="dimmed" className={styles.code}>Code</Text>
                                </div>

                                <Stack gap="xs">
                                    {value.mocks.map((mock: TMock) => (
                                        <Mock
                                            key={mock.id}
                                            mock={mock}
                                            onEditClick={onEditMock}
                                            onCopyClick={onCopyMock}
                                            onDelete={onDeleteMock}
                                            onChange={onChangeMock}
                                        />
                                    ))}
                                </Stack>
                            </>
                        </MockGroup>
                    ))}
            </Stack>

            {emptyMocks.length > 0 && (
                <div>
                    <div className={styles.tableHeader}>
                        <Text size="xs" c="dimmed" className={styles.status}> </Text>
                        <Text size="xs" c="dimmed" className={styles.method}>Method</Text>
                        <Text size="xs" c="dimmed" className={styles.url}>URL</Text>
                        <Text size="xs" c="dimmed" className={styles.code}>Code</Text>
                    </div>

                    <Stack gap="xs">
                        {emptyMocks.map((mock) => (
                            <Mock
                                key={mock.id}
                                mock={mock}
                                onEditClick={onEditMock}
                                onCopyClick={onCopyMock}
                                onDelete={onDeleteMock}
                                onChange={onChangeMock}
                            />
                        ))}
                    </Stack>
                </div>
            )}

            {emptyGroups.length > 0 && (
                <Stack gap="xs">
                    <Text c="dimmed">Empty groups</Text>

                    {emptyGroups.map(((group) => (
                        <MockGroup
                            key={group.id}
                            group={group}
                            onDeleteGroup={handleDeleteGroup}
                        />
                    )))}
                </Stack>
            )}
        </Stack>
    );
};
