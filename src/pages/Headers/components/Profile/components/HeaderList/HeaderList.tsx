import React, { FC } from 'react';
import { ActionIcon, Group, Switch, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconRegex, IconTrash } from '@tabler/icons-react';

import { Card } from '../../../../../../components/Card';
import { HttpMethod } from '../../../../../../components/HttpMethod';
import { NotFound } from '../../../../../../components/NotFound';
import { iconSize } from '../../../../../../constant';
import { THeader } from '../../../../../../types';
import styles from './HeaderList.module.css';

interface HeaderListProps {
  headers: THeader[];
  onDelete: (id: string) => void;
  onEdit: (header: THeader) => void;
  onChange: (id: string, header: THeader) => void;
}

export const HeaderList: FC<HeaderListProps> = ({ headers, onDelete, onEdit, onChange }) => {
  const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>, header: THeader): void => {
    const newHeader: THeader = {
      ...header,
      isActive: e.currentTarget.checked,
    };
    onChange(header.id, newHeader);
  };

  if (headers.length === 0) {
    return <NotFound text="No headers to show" />;
  }

  const handleDelete =
    (id: string) =>
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      if (e.detail < 2) {
        return;
      }

      onDelete(id);
    };

  return (
    <div className={styles.list}>
      {headers.map((header) => (
        <Card
          key={header.id}
          p="0.35rem 0.7rem"
          className={styles.row}
          data-testid="header-row"
        >
          <Text
            size="xs"
            fw={600}
            className={styles.key}
            title={header.key}
          >
            {header.key}:
          </Text>

          <Text
            size="xs"
            className={styles.value}
            title={header.value}
          >
            {header.value}
          </Text>

          <div className={styles.url}>
            {header.httpMethod && <HttpMethod method={header?.httpMethod} />}
            {header.url ? (
              <Text
                size="xs"
                c="gray.6"
                className={styles.urlText}
                title={header.url}
              >
                {header.url}
              </Text>
            ) : (
              <Text
                size="xs"
                c="dimmed"
                className={styles.urlText}
              >
                Works for all URL&apos;s
              </Text>
            )}

            {header.url && header.urlType === 'regexp' && (
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
                  style={{ flexShrink: 0 }}
                  data-testid="header-row/regexp"
                />
              </Tooltip>
            )}
          </div>

          <div className={styles.actions}>
            <Switch
              size="xs"
              radius="md"
              color="green"
              title="Enable/disable header"
              checked={header.isActive}
              data-testid="header-row/status-switch"
              onChange={(e) => handleChangeStatus(e, header)}
            />

            <Group gap="0.4rem">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                radius="sm"
                title="Edit header"
                data-testid="header-row/edit"
                onClick={(): void => onEdit(header)}
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
                  data-testid="header-row/delete"
                  onClick={handleDelete(header.id)}
                >
                  <IconTrash size={iconSize} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </div>
        </Card>
      ))}
    </div>
  );
};
