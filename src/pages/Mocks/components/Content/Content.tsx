import React, { FC, useMemo } from 'react';
import { Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { Mock } from './components/Mock';
import { TMock, TMockGroup } from '../../../../types';
import { MockGroup } from './components/MockGroup';
import { filterMocks } from '../../../../utils/filterMocks';
import styles from './Content.module.css';

type ContentProps = {
    mocks: TMock[];
    groups: TMockGroup[];
    onDeleteMock: (mockId: string) => void;
    onChangeMock: (newMock: TMock) => void;
    onEditMock: (mock: TMock) => void;
    onCopyMock: (mock: TMock) => void;
    onDeleteGroup: (groupId: TMockGroup['id']) => void;
    onClearGroup: (groupId: TMockGroup['id']) => void;
};

export const Content: FC<ContentProps> = ({
    mocks,
    groups,
    onCopyMock,
    onDeleteMock,
    onChangeMock,
    onEditMock,
    onDeleteGroup,
    onClearGroup,
}) => {
    const { emptyGroups, emptyMocks, mocksByGroups } = useMemo(() => {
        return filterMocks(mocks, groups);
    }, [mocks, groups]);

    const handleDeleteGroup = (group: TMockGroup) => {
        modals.openConfirmModal({
            title: 'Delete group',
            children: <Text size="sm">Are you sure you want to delete group «{group.name}» and all mocks in it?</Text>,
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
            onConfirm: () => onDeleteGroup(group.id),
        });
    };

    const handleRemoveMocks = (group: TMockGroup) => onClearGroup(group.id);

    return (
        <Stack gap="xl">
            {Object.values(mocksByGroups).length > 0 && (
                <Stack gap="xs">
                    {Object.values(mocksByGroups).map((value) => (
                        <MockGroup
                            key={value.group.id}
                            group={value.group}
                            hasMocks={mocks.length > 0}
                            onDeleteGroup={handleDeleteGroup}
                            onRemoveMocks={handleRemoveMocks}
                        >
                            <>
                                <div className={styles.tableHeader}>
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        className={styles.status}
                                    >
                                        {' '}
                                    </Text>
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        className={styles.method}
                                    >
                                        Method
                                    </Text>
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        className={styles.url}
                                    >
                                        URL
                                    </Text>
                                    <Text
                                        size="xs"
                                        c="dimmed"
                                        className={styles.code}
                                    >
                                        Code
                                    </Text>
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
            )}

            {emptyMocks.length > 0 && (
                <div>
                    <div className={styles.tableHeader}>
                        <Text
                            size="xs"
                            c="dimmed"
                            className={styles.status}
                        >
                            {' '}
                        </Text>
                        <Text
                            size="xs"
                            c="dimmed"
                            className={styles.method}
                        >
                            Method
                        </Text>
                        <Text
                            size="xs"
                            c="dimmed"
                            className={styles.url}
                        >
                            URL
                        </Text>
                        <Text
                            size="xs"
                            c="dimmed"
                            className={styles.code}
                        >
                            Code
                        </Text>
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

                    {emptyGroups.map((group) => (
                        <MockGroup
                            key={group.id}
                            group={group}
                            onDeleteGroup={handleDeleteGroup}
                        />
                    ))}
                </Stack>
            )}
        </Stack>
    );
};
