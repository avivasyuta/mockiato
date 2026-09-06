import { ActionIcon, Group, Switch, Text, Tooltip } from '@mantine/core';
import React, { FC } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { THeader } from '../../../../../../types';
import { Card } from '../../../../../../components/Card';
import { iconSize } from '../../../../../../contstant';
import { HttpMethod } from '../../../../../../components/HttpMethod';
import { NotFound } from '../../../../../../components/NotFound';
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
          p="0.2rem 0.6rem"
        >
          <Group
            gap="xs"
            align="center"
          >
            <Group
              gap="xs"
              flex={1}
              miw={0}
            >
              <Text
                size="xs"
                fw={600}
              >
                {header.key}:
              </Text>
              <Text size="xs">{header.value}</Text>
            </Group>

            <div className={styles.url}>
              {header.httpMethod && <HttpMethod method={header?.httpMethod} />}
              {header.url ? (
                <Text size="xs">{header.url}</Text>
              ) : (
                <Text
                  size="xs"
                  c="orange.5"
                >
                  Works for all URL&apos;s
                </Text>
              )}
            </div>

            <Group gap="1.5rem">
              <Switch
                size="xs"
                radius="sm"
                onLabel="ON"
                offLabel="OFF"
                checked={header.isActive}
                onChange={(e) => handleChangeStatus(e, header)}
              />

              <Group gap="0.4rem">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  radius="sm"
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
                    onClick={handleDelete(header.id)}
                  >
                    <IconTrash size={iconSize} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>
          </Group>
        </Card>
      ))}
    </div>
  );
};
