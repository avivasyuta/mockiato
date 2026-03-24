import React, { FC, useEffect, useRef, useState } from 'react';
import { ActionIcon, Group, Switch, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconEdit, IconCopy, IconInfoCircle, IconTrash, IconRegex, IconGripVertical } from '@tabler/icons-react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import {
    attachClosestEdge, extractClosestEdge, type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { HttpMethod } from '../../../../../../components/HttpMethod';
import { HttpStatus } from '../../../../../../components/HttpStatus';
import { Card } from '../../../../../../components/Card';
import { TMock } from '../../../../../../types';
import { useStore } from '../../../../../../hooks/useStore';
import { iconSize } from '../../../../../../contstant';
import styles from './Mock.module.css';

interface MockProps {
    mock: TMock;
    isLast?: boolean;
    onEditClick: (mock: TMock) => void;
    onCopyClick: (mock: TMock) => void;
    onChange: (mock: TMock) => void;
    onDelete: (mockId: string) => void;
}

export const Mock: FC<MockProps> = ({ mock, isLast, onDelete, onChange, onCopyClick, onEditClick }) => {
    const ref = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLButtonElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    const theme = useMantineTheme();
    const [settings] = useStore('settings');
    const isInlineComment = settings?.commentDisplayMode === 'inline';

    useEffect(() => {
        const el = ref.current;
        const handle = dragHandleRef.current;
        if (!el || !handle) return undefined;

        const cleanupDraggable = draggable({
            element: el,
            dragHandle: handle,
            getInitialData: () => ({ type: 'mock', mockId: mock.id, groupId: mock.groupId ?? null }),
            onDragStart: () => setIsDragging(true),
            onDrop: () => setIsDragging(false),
        });

        const cleanupDropTarget = dropTargetForElements({
            element: el,
            canDrop: ({ source }) => source.data.type === 'mock' && source.data.mockId !== mock.id,
            getData: ({ input, element }) => {
                return attachClosestEdge(
                    { type: 'mock', mockId: mock.id, groupId: mock.groupId ?? null },
                    { element, input, allowedEdges: ['top', 'bottom'] },
                );
            },
            onDragEnter: ({ self }) => {
                const edge = extractClosestEdge(self.data);
                setClosestEdge(edge === 'bottom' && !isLast ? null : edge);
            },
            onDrag: ({ self }) => {
                const edge = extractClosestEdge(self.data);
                setClosestEdge(edge === 'bottom' && !isLast ? null : edge);
            },
            onDragLeave: () => setClosestEdge(null),
            onDrop: () => setClosestEdge(null),
        });

        return () => {
            cleanupDraggable();
            cleanupDropTarget();
        };
    }, [mock.id, mock.groupId, isLast]);

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>): void => {
        if (e.detail < 2) {
            return;
        }

        onDelete(mock.id);
    };

    const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>): void => {
        onChange({
            ...mock,
            isActive: e.currentTarget.checked,
        });
    };

    const handleCopy = (): void => onCopyClick(mock);
    const handleEditClick = (): void => onEditClick(mock);

    return (
        <div style={{ position: 'relative' }}>
            <Card
                key={mock.id}
                p="0.34rem 0.6rem"
                ref={ref}
                style={{ opacity: isDragging ? 0.4 : undefined }}
            >
                <Group gap="xs">
                    <ActionIcon
                        ref={dragHandleRef}
                        className={styles.dragHandle}
                        variant="subtle"
                        color="gray"
                        size="sm"
                    >
                        <IconGripVertical size={14} />
                    </ActionIcon>

                    <Switch
                        onLabel="ON"
                        offLabel="OFF"
                        size="xs"
                        checked={mock.isActive}
                        title="Enable/disable mock"
                        onChange={handleChangeStatus}
                    />

                    <div className={styles.method}>
                        <HttpMethod method={mock.httpMethod} />
                    </div>

                    <Group
                        align="center"
                        className={styles.url}
                        gap="xs"
                    >
                        <Text
                            size="xs"
                            title={mock.url}
                            className={styles.urlText}
                        >
                            {mock.url}
                        </Text>

                        {mock.urlType === 'regexp' && (
                            <Tooltip
                                label="RegExp enabled"
                                position="bottom"
                                transitionProps={{ transition: 'scale' }}
                                openDelay={150}
                                withArrow
                            >
                                <IconRegex
                                    size={16}
                                    color="#9775fa"
                                />
                            </Tooltip>
                        )}

                        {mock.comment && (
                            isInlineComment ? (
                                <Text
                                    size="xs"
                                    c="dimmed"
                                    className={styles.commentInline}
                                    title={mock.comment}
                                >
                                    {mock.comment}
                                </Text>
                            ) : (
                                <Tooltip
                                    label={mock.comment}
                                    withArrow
                                    multiline
                                    maw={300}
                                    position="bottom"
                                    className={styles.comment}
                                >
                                    <span>
                                        <IconInfoCircle
                                            size={16}
                                            color={theme.colors.blue[4]}
                                        />
                                    </span>
                                </Tooltip>
                            )
                        )}
                    </Group>

                    <Group className={styles.code}>
                        <HttpStatus status={mock.httpStatusCode} />
                    </Group>

                    <Group gap="0.4rem">
                        <Tooltip
                            label="Double click to delete"
                            position="bottom"
                            transitionProps={{ transition: 'scale-y' }}
                            openDelay={300}
                            withArrow
                        >
                            <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                radius="sm"
                                onClick={handleDelete}
                            >
                                <IconTrash size={iconSize} />
                            </ActionIcon>
                        </Tooltip>

                        <ActionIcon
                            variant="subtle"
                            color="cyan"
                            size="sm"
                            radius="sm"
                            title="Clone mock"
                            onClick={handleCopy}
                        >
                            <IconCopy size={iconSize} />
                        </ActionIcon>

                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            radius="sm"
                            title="Edit mock"
                            onClick={handleEditClick}
                        >
                            <IconEdit size={iconSize} />
                        </ActionIcon>
                    </Group>
                </Group>
            </Card>
            
            {closestEdge && <DropIndicator edge={closestEdge} gap="0.25rem" />}
        </div>
    );
};
