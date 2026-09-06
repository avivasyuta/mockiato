import React, { FC, useEffect, useRef, useState } from 'react';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { ActionIcon, Badge, Collapse, Group, Stack, Switch, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconEdit,
  IconGripVertical,
  IconInfoCircle,
  IconRegex,
  IconTrash,
} from '@tabler/icons-react';

import { Dot } from '~/components/Dot/Dot';
import { getStatusCodeColor } from '~/utils/getHttpStatusColor';

import { Card } from '../../../../../../components/Card';
import { HttpMethod } from '../../../../../../components/HttpMethod';
import { HttpStatus } from '../../../../../../components/HttpStatus';
import { iconSize } from '../../../../../../contstant';
import { useStore } from '../../../../../../hooks/useStore';
import { TMock } from '../../../../../../types';
import styles from './Mock.module.css';

interface MockProps {
  mock: TMock;
  isLast?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: (isExpanded: boolean) => void;
  onEditClick: (mock: TMock) => void;
  onCopyClick: (mock: TMock) => void;
  onChange: (mock: TMock) => void;
  onDelete: (mockId: string) => void;
}

export const Mock: FC<MockProps> = ({
  mock,
  isLast,
  isExpanded = false,
  onToggleExpand,
  onDelete,
  onChange,
  onCopyClick,
  onEditClick,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const [isOpen, { toggle, open, close }] = useDisclosure(false);

  // Sync the internal state with the external isExpanded prop (used by "Expand/Collapse All")
  useEffect(() => {
    if (isExpanded) {
      open();
    } else {
      close();
    }
  }, [isExpanded, open, close]);

  const handleToggleExpand = () => {
    toggle();
    onToggleExpand?.(!isOpen);
  };

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
        p="0.34rem"
        ref={ref}
        statusColor={getStatusCodeColor(mock.httpStatusCode)}
        style={{ opacity: isDragging ? 0.4 : undefined, cursor: isDragging ? 'grabbing' : 'pointer' }}
      >
        <Group
          gap="xs"
          className={styles.mockRow}
        >
          <Group gap="0">
            <ActionIcon
              ref={dragHandleRef}
              className={styles.dragHandle}
              variant="subtle"
              color="gray"
              size="sm"
              radius="sm"
            >
              <IconGripVertical size={14} />
            </ActionIcon>

            <ActionIcon
              variant="subtle"
              color="gray"
              radius="sm"
              size="sm"
              onClick={handleToggleExpand}
            >
              {isOpen ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
            </ActionIcon>
          </Group>

          <Group
            align="center"
            className={styles.url}
            gap="xs"
            wrap="nowrap"
          >
            {mock.name && (
              <>
                <Text
                  size="xs"
                  truncate="end"
                >
                  {mock.name}
                </Text>

                <Dot />
              </>
            )}

            <Group gap="sm">
              {settings?.displayHttpMethodInline && <HttpMethod method={mock.httpMethod} />}

              <Group
                gap="0.4rem"
                className={styles.urlGroup}
                wrap="nowrap"
              >
                {mock.urlType === 'regexp' && (
                  <Tooltip
                    label="RegExp enabled"
                    position="bottom"
                    transitionProps={{ transition: 'scale' }}
                    openDelay={150}
                    withArrow
                  >
                    <IconRegex
                      size={12}
                      color="#9775fa"
                      style={{ flexShrink: 0 }}
                    />
                  </Tooltip>
                )}

                <Text
                  size="xs"
                  truncate="end"
                  c="gray.6"
                  flex={1}
                  miw={0}
                >
                  {mock.url}
                </Text>
              </Group>
            </Group>
          </Group>

          <Group gap="1.5rem">
            {mock.comment && (
              <Tooltip
                label={mock.comment}
                withArrow
                multiline
                maw={300}
                position="bottom"
                className={styles.comment}
              >
                {isInlineComment ? (
                  <Badge
                    variant="default"
                    tt="none"
                    className={styles.commentBadge}
                  >
                    {mock.comment}
                  </Badge>
                ) : (
                  <span>
                    <IconInfoCircle
                      size={16}
                      color={theme.colors.blue[4]}
                    />
                  </span>
                )}
              </Tooltip>
            )}

            <Switch
              onLabel="ON"
              offLabel="OFF"
              size="xs"
              radius="sm"
              color="green"
              checked={mock.isActive}
              title="Enable/disable mock"
              onChange={handleChangeStatus}
            />

            <Group gap="0.4rem">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                radius="sm"
                title="Clone mock"
                onClick={handleCopy}
              >
                <IconCopy size={iconSize} />
              </ActionIcon>

              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                radius="sm"
                title="Edit mock"
                onClick={handleEditClick}
              >
                <IconEdit size={iconSize} />
              </ActionIcon>

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
            </Group>
          </Group>
        </Group>

        <Collapse expanded={isOpen}>
          <Stack
            gap="0.1rem"
            pt="0.3rem"
            px="0.45rem"
            mt="0.3rem"
            className={styles.details}
          >
            <Group gap="0.5rem">
              <Text
                size="xs"
                fw={600}
                className={styles.detailLabel}
              >
                Method:
              </Text>
              <HttpMethod method={mock.httpMethod} />
            </Group>

            <Group gap="0.5rem">
              <Text
                size="xs"
                fw={600}
                className={styles.detailLabel}
              >
                Status code:
              </Text>
              <HttpStatus status={mock.httpStatusCode} />
            </Group>

            <Group gap="0.5rem">
              <Text
                size="xs"
                fw={600}
                className={styles.detailLabel}
              >
                Delay:
              </Text>
              <Text size="xs">{mock.delay} ms</Text>
            </Group>

            <Group gap="0.5rem">
              <Text
                size="xs"
                fw={600}
                className={styles.detailLabel}
              >
                Response Headers:
              </Text>

              {mock.responseHeaders.length > 0 ? (
                <Group gap="0.5rem">
                  {mock.responseHeaders.map((header, index) => (
                    <Text
                      key={header.id}
                      size="xs"
                      color={theme.colors.gray[7]}
                    >
                      {header.key}: {header.value}
                      {index < mock.responseHeaders.length - 1 && ','}
                    </Text>
                  ))}
                </Group>
              ) : (
                <Text size="xs">empty</Text>
              )}
            </Group>

            {mock.comment && (
              <Group gap="0.5rem">
                <Text
                  size="xs"
                  fw={600}
                  className={styles.detailLabel}
                >
                  Comment:
                </Text>
                <Text size="xs">{mock.comment}</Text>
              </Group>
            )}
          </Stack>
        </Collapse>
      </Card>

      {closestEdge && (
        <DropIndicator
          edge={closestEdge}
          gap="0.25rem"
        />
      )}
    </div>
  );
};
