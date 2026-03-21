import React, { FC, useEffect, useRef, useState } from 'react';
import { ActionIcon, Collapse, Group, Menu, Text } from '@mantine/core';
import {
    IconChevronDown,
    IconChevronUp,
    IconCircleOff,
    IconDotsVertical,
    IconGripVertical,
    IconPower,
    IconTrash,
} from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
    attachClosestEdge, extractClosestEdge, type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { TMock, TMockGroup } from '../../../../../../types';
import styles from './MockGroup.module.css';

type MockGroupProps = React.PropsWithChildren & {
    group: TMockGroup;
    mocks?: TMock[];
    isLast?: boolean;
    isExpanded?: boolean;
    onToggleGroup?: (isExpanded: boolean) => void;
    onDeleteGroup: (group: TMockGroup) => void;
    onRemoveMocks?: (group: TMockGroup) => void;
    onDisableAll?: (group: TMockGroup) => void;
    onEnableAll?: (group: TMockGroup) => void;
};

export const MockGroup: FC<MockGroupProps> = ({
    group,
    children,
    mocks = [],
    isLast,
    isExpanded = true,
    onToggleGroup,
    onDeleteGroup,
    onRemoveMocks,
    onEnableAll,
    onDisableAll,
}) => {
    const [isOpen, { toggle, open, close }] = useDisclosure(true);
    const ref = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
    const [isMockDraggedOver, setIsMockDraggedOver] = useState(false);

    useEffect(() => {
        const el = ref.current;
        const handle = dragHandleRef.current;
        if (!el || !handle) return undefined;

        const cleanupDraggable = draggable({
            element: el,
            dragHandle: handle,
            getInitialData: () => ({ type: 'group', groupId: group.id }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });

        const cleanupDropTarget = dropTargetForElements({
            element: el,
            getData: ({ input, element, source }) => {
                if (source.data.type === 'group') {
                    return attachClosestEdge(
                        { type: 'group', groupId: group.id },
                        { element, input, allowedEdges: ['top', 'bottom'] },
                    );
                }
                // For mocks being dropped onto the group
                return { type: 'group', groupId: group.id };
            },
            onDragEnter: ({ self, source }) => {
                if (source.data.type === 'mock') {
                    setIsMockDraggedOver(true);
                } else {
                    const edge = extractClosestEdge(self.data);
                    setClosestEdge(edge === 'bottom' && !isLast ? null : edge);
                }
            },
            onDrag: ({ self, source }) => {
                if (source.data.type === 'mock') {
                    setIsMockDraggedOver(true);
                } else {
                    const edge = extractClosestEdge(self.data);
                    setClosestEdge(edge === 'bottom' && !isLast ? null : edge);
                }
            },
            onDragLeave: () => {
                setClosestEdge(null);
                setIsMockDraggedOver(false);
            },
            onDrop: () => {
                setClosestEdge(null);
                setIsMockDraggedOver(false);
            },
        });

        return () => {
            cleanupDraggable();
            cleanupDropTarget();
        };
    }, [group.id, isLast]);

    // Sync the internal state with the external isExpanded prop
    useEffect(() => {
        if (isExpanded) {
            open();
        } else {
            close();
        }
    }, [isExpanded, open, close]);

    const handleToggle = () => {
        toggle();
        // Notify parent component about the state change
        if (onToggleGroup) {
            onToggleGroup(!isOpen);
        }
    };

    const handleRemoveMocks = () => {
        onRemoveMocks?.(group);
    };

    const handleEnableAll = () => {
        onEnableAll?.(group);
    };

    const handleDisableAll = () => {
        onDisableAll?.(group);
    };

    const allEnabled = mocks.every((item) => item.isActive);
    const allDisabled = mocks.every((item) => !item.isActive);

    return (
        <div style={{ position: 'relative' }}>
            <div
                className={`${styles.root} ${isMockDraggedOver ? styles.draggedOver : ''}`}
                ref={ref}
                style={{ opacity: isDragging ? 0.4 : undefined }}
            >
                <Group justify="space-between">
                    <Group gap="0">
                        <ActionIcon
                            ref={dragHandleRef}
                            className={styles.dragHandle}
                            variant="subtle"
                            color="gray"
                            size="sm"
                        >
                            <IconGripVertical size={14} />
                        </ActionIcon>
                        
                        {children ? (
                            <Text
                                ml="xs"
                                className={styles.groupName}
                                onClick={handleToggle}
                            >
                                {group.name} {isOpen ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                            </Text>
                        ) : (
                            <Text ml="xs">{group.name}</Text>
                        )}
                    </Group>

                    <Menu
                        withinPortal
                        position="bottom-end"
                        shadow="sm"
                    >
                        <Menu.Target>
                            <ActionIcon
                                variant="subtle"
                                color="gray"
                            >
                                <IconDotsVertical size={14} />
                            </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                            {mocks.length > 0 && (
                                <>
                                    <Menu.Item
                                        leftSection={<IconPower size={14} />}
                                        disabled={allEnabled}
                                        onClick={handleEnableAll}
                                    >
                                        Enable all
                                    </Menu.Item>
                                    <Menu.Item
                                        leftSection={<IconCircleOff size={12} />}
                                        disabled={allDisabled}
                                        onClick={handleDisableAll}
                                    >
                                        Disable all
                                    </Menu.Item>

                                    <Menu.Divider />
                                    <Menu.Label>Danger zone</Menu.Label>

                                    <Menu.Item
                                        leftSection={<IconTrash size={12} />}
                                        color="red"
                                        onClick={handleRemoveMocks}
                                    >
                                        Remove mocks from group
                                    </Menu.Item>
                                </>
                            )}

                            <Menu.Item
                                leftSection={<IconTrash size={12} />}
                                color="red"
                                onClick={() => onDeleteGroup(group)}
                            >
                                Delete group
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                {children && (
                    <Collapse key={mocks.length} in={isOpen}>
                        <div className={styles.content}>{children}</div>
                    </Collapse>
                )}
            </div>
            
            {closestEdge && <DropIndicator edge={closestEdge} gap="0.25rem" />}
        </div>
    );
};
