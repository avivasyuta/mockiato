import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Stack, Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { monitorForElements, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { TMock, TMockGroup } from '~/types';
import { filterMocks } from '~/utils/filterMocks';
import { Mock } from './components/Mock';
import { MockGroup } from './components/MockGroup';
import styles from './Content.module.css';

type ContentProps = {
    mocks: TMock[];
    groups: TMockGroup[];
    expandedGroups: Set<string>;
    onToggleGroup: (groupId: string, isExpanded: boolean) => void;
    onDeleteMock: (mockId: string) => void;
    onChangeMock: (newMock: TMock) => void;
    onEditMock: (mock: TMock) => void;
    onCopyMock: (mock: TMock) => void;
    onDeleteGroup: (groupId: TMockGroup['id']) => void;
    onClearGroup: (groupId: TMockGroup['id']) => void;
    onToggleMocks: (groupId: TMockGroup['id'], status: boolean) => void;
    onReorderGroups: (activeId: string, overId: string) => void;
    onUpdateMocks: (mocks: TMock[]) => void;
};

const TableHeader = () => (
    <div className={styles.tableHeader}>
        <Text size="xs" c="dimmed" className={styles.drag}>{' '}</Text>
        <Text size="xs" c="dimmed" className={styles.status}>{' '}</Text>
        <Text size="xs" c="dimmed" className={styles.method}>Method</Text>
        <Text size="xs" c="dimmed" className={styles.url}>URL</Text>
        <Text size="xs" c="dimmed" className={styles.code}>Code</Text>
    </div>
);

const UngroupedDropZone: FC<React.PropsWithChildren<{ isEmpty: boolean }>> = ({ children, isEmpty }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDraggedOver, setIsDraggedOver] = React.useState(false);

    useEffect(() => {
        if (!ref.current) {
            return undefined;
        }

        return dropTargetForElements({
            element: ref.current,
            canDrop: ({ source }) => source.data.type === 'mock',
            getData: () => ({ type: 'ungrouped' }),
            onDragEnter: () => setIsDraggedOver(true),
            onDragLeave: () => setIsDraggedOver(false),
            onDrop: () => setIsDraggedOver(false),
        });
    }, []);

    const className = [
        styles.ungroupedDropZone,
        isEmpty ? styles.ungroupedDropZoneEmpty : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            ref={ref}
            className={className}
            style={isDraggedOver && isEmpty ? { borderColor: 'var(--mantine-color-blue-5)' } : undefined}>
            {isEmpty && isDraggedOver && <Text size="sm" c="dimmed">Drop here to ungroup</Text>}
            {children}
        </div>
    );
};

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
    const result = [...arr];
    const [item] = result.splice(from, 1);
    result.splice(to, 0, item);
    return result;
}

export const Content: FC<ContentProps> = ({
    mocks,
    groups,
    expandedGroups,
    onToggleGroup,
    onCopyMock,
    onDeleteMock,
    onChangeMock,
    onEditMock,
    onDeleteGroup,
    onClearGroup,
    onToggleMocks,
    onReorderGroups,
    onUpdateMocks,
}) => {
    const { ungroupedMocks, groupsWithMocks } = useMemo(() => {
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
                size: 'xs',
            },
            cancelProps: {
                size: 'xs',
                variant: 'subtle',
                color: 'gray',
            },
            onConfirm: () => onDeleteGroup(group.id),
        });
    };

    const handleRemoveMocks = (group: TMockGroup) => onClearGroup(group.id);

    const moveMockToGroup = (mockId: string, targetGroupId: string | null, overMockId: string | null) => {
        const mockToMove = mocks.find((m) => m.id === mockId);
        if (!mockToMove) return;

        const updated = { ...mockToMove };
        if (targetGroupId) {
            updated.groupId = targetGroupId;
        } else {
            delete updated.groupId;
        }

        const without = mocks.filter((m) => m.id !== mockId);

        if (overMockId) {
            const overIdx = without.findIndex((m) => m.id === overMockId);
            without.splice(overIdx, 0, updated);
        } else if (targetGroupId) {
            let lastIdx = -1;
            for (let i = without.length - 1; i >= 0; i--) {
                if (without[i].groupId === targetGroupId) {
                    lastIdx = i;
                    break;
                }
            }
            without.splice(lastIdx + 1, 0, updated);
        } else {
            without.push(updated);
        }

        onUpdateMocks(without);
    };

    // Monitor for all drag-and-drop events
    useEffect(() => {
        return monitorForElements({
            onDrop: ({ source, location }) => {
                const target = location.current.dropTargets[0];
                if (!target) return;

                const sourceType = source.data.type;
                const targetType = target.data.type;

                // Group reorder
                if (sourceType === 'group' && targetType === 'group') {
                    const sourceGroupId = source.data.groupId as string;
                    const targetGroupId = target.data.groupId as string;
                    if (sourceGroupId === targetGroupId) return;

                    const edge = extractClosestEdge(target.data);
                    const oldIdx = groups.findIndex((g) => g.id === sourceGroupId);
                    const newIdx = groups.findIndex((g) => g.id === targetGroupId);
                    if (oldIdx === -1 || newIdx === -1) return;

                    // Adjust index based on edge
                    let finalIdx = newIdx;
                    if (edge === 'bottom' && oldIdx < newIdx) {
                        finalIdx = newIdx;
                    } else if (edge === 'top' && oldIdx > newIdx) {
                        finalIdx = newIdx;
                    } else if (edge === 'bottom' && oldIdx > newIdx) {
                        finalIdx = newIdx + 1;
                    } else if (edge === 'top' && oldIdx < newIdx) {
                        finalIdx = newIdx - 1;
                    }

                    onReorderGroups(sourceGroupId, groups[finalIdx]?.id ?? targetGroupId);
                    return;
                }

                if (sourceType !== 'mock') return;

                const sourceMockId = source.data.mockId as string;

                // Mock dropped on another mock
                if (targetType === 'mock') {
                    const targetMockId = target.data.mockId as string;
                    const sourceGroupId = source.data.groupId as string | null;
                    const targetGroupId = target.data.groupId as string | null;
                    const edge = extractClosestEdge(target.data);

                    if (sourceGroupId === targetGroupId) {
                        // Same group reorder
                        const subset = mocks.filter((m) =>
                            sourceGroupId ? m.groupId === sourceGroupId : !m.groupId,
                        );
                        const oldIdx = subset.findIndex((m) => m.id === sourceMockId);
                        const newIdx = subset.findIndex((m) => m.id === targetMockId);

                        if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                            // Adjust for edge
                            let adjustedIdx = newIdx;
                            if (edge === 'bottom' && oldIdx < newIdx) {
                                adjustedIdx = newIdx;
                            } else if (edge === 'top' && oldIdx > newIdx) {
                                adjustedIdx = newIdx;
                            } else if (edge === 'bottom' && oldIdx > newIdx) {
                                adjustedIdx = newIdx + 1;
                            } else if (edge === 'top' && oldIdx < newIdx) {
                                adjustedIdx = newIdx - 1;
                            }

                            const reordered = arrayMove(subset, oldIdx, adjustedIdx);
                            let ri = 0;
                            const finalMocks = mocks.map((m) => {
                                const belongs = sourceGroupId ? m.groupId === sourceGroupId : !m.groupId;
                                return belongs ? reordered[ri++] : m;
                            });
                            onUpdateMocks(finalMocks);
                        }
                    } else {
                        // Cross-group move
                        moveMockToGroup(sourceMockId, targetGroupId, targetMockId);
                    }
                }
                // Mock dropped on a group header
                else if (targetType === 'group') {
                    const targetGroupId = target.data.groupId as string;
                    moveMockToGroup(sourceMockId, targetGroupId, null);
                }
                // Mock dropped on ungrouped zone
                else if (targetType === 'ungrouped') {
                    moveMockToGroup(sourceMockId, null, null);
                }
            },
        });
    }, [mocks, groups, onReorderGroups, onUpdateMocks]);

    return (
        <Stack gap="xl">
            {groupsWithMocks.length > 0 && (
                <Stack gap="xs">
                    {groupsWithMocks.map((value, groupIndex) => (
                        <MockGroup
                            key={value.group.id}
                            group={value.group}
                            mocks={value.mocks}
                            isLast={groupIndex === groupsWithMocks.length - 1}
                            isExpanded={expandedGroups.has(value.group.id)}
                            onToggleGroup={(isExpanded) => onToggleGroup(value.group.id, isExpanded)}
                            onDeleteGroup={handleDeleteGroup}
                            onRemoveMocks={handleRemoveMocks}
                            onEnableAll={(group) => onToggleMocks(group.id, true)}
                            onDisableAll={(group) => onToggleMocks(group.id, false)}
                        >
                            {value.mocks.length > 0 && <TableHeader />}
                            <Stack gap="xs">
                                {value.mocks.map((mock, mockIndex) => (
                                    <Mock
                                        key={mock.id}
                                        mock={mock}
                                        isLast={mockIndex === value.mocks.length - 1}
                                        onEditClick={onEditMock}
                                        onCopyClick={onCopyMock}
                                        onDelete={onDeleteMock}
                                        onChange={onChangeMock}
                                    />
                                ))}
                            </Stack>
                        </MockGroup>
                    ))}
                </Stack>
            )}

            <UngroupedDropZone isEmpty={ungroupedMocks.length === 0}>
                {ungroupedMocks.length > 0 && (
                    <>
                        <TableHeader />
                        <Stack gap="xs">
                            {ungroupedMocks.map((mock, idx) => (
                                <Mock
                                    key={mock.id}
                                    mock={mock}
                                    isLast={idx === ungroupedMocks.length - 1}
                                    onEditClick={onEditMock}
                                    onCopyClick={onCopyMock}
                                    onDelete={onDeleteMock}
                                    onChange={onChangeMock}
                                />
                            ))}
                        </Stack>
                    </>
                )}
            </UngroupedDropZone>
        </Stack>
    );
};
