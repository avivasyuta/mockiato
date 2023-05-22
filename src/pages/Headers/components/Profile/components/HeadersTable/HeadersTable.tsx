import {
    ActionIcon, Group, Switch, Text,
} from '@mantine/core';
import React, { FC } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { THeader } from '../../../../../../types';
import { Card } from '../../../../../../components/Card';
import { iconSize } from '../../../../../../contstant';
import styles from './HeaderTable.module.css';
import { HttpMethod } from '../../../../../../components/HttpMethod';

interface HeadersTableProps {
    headers: THeader[]
    onDelete: (id: string) => void
    onEdit: (header: THeader) => void
    onChange: (id: string, header: THeader) => void
}

export const HeadersTable: FC<HeadersTableProps> = ({
    headers,
    onDelete,
    onEdit,
    onChange,
}) => {
    const handleChangeStatus = (e: React.ChangeEvent<HTMLInputElement>, header: THeader): void => {
        const newHeader: THeader = {
            ...header,
            isActive: e.currentTarget.checked,
        };
        onChange(header.id, newHeader);
    };

    if (headers.length === 0) {
        return <Text size="xs" c="gray.7">There are no headers</Text>;
    }

    return (
        <>
            <div className={styles.tableHeader}>
                <Text size="xs" color="dimmed" className={styles.status}> </Text>
                <Text size="xs" color="dimmed" className={styles.grow}>Key</Text>
                <Text size="xs" color="dimmed" className={styles.grow}>Value</Text>
                <Text size="xs" color="dimmed" className={styles.grow}>URL</Text>
                <Text size="xs" color="dimmed" className={styles.actions}> </Text>
            </div>

            <div className={styles.tableBody}>
                {headers.map((header) => (
                    <Card key={header.id} className={styles.header}>
                        <Group spacing="xs" align="center">
                            <Switch
                                size="xs"
                                onLabel="ON"
                                offLabel="OFF"
                                checked={header.isActive}
                                onChange={(e) => handleChangeStatus(e, header)}
                            />

                            <div className={styles.grow}>
                                <Text size="xs">{header.key}</Text>
                            </div>

                            <div className={styles.grow}>
                                <Text size="xs">{header.value}</Text>
                            </div>

                            <div className={styles.url}>
                                {header.httpMethod && <HttpMethod method={header?.httpMethod} />}
                                {header.url ? (
                                    <Text size="xs">{header.url}</Text>
                                ) : (
                                    <Text size="xs" c="orange.5">Works for all URL&apos;s</Text>
                                )}
                            </div>

                            <Group spacing="sm">
                                <ActionIcon
                                    variant="subtle"
                                    color="red"
                                    size="sm"
                                    radius="sm"
                                    onClick={(): void => onDelete(header.id)}
                                >
                                    <IconTrash size={iconSize} />
                                </ActionIcon>

                                <ActionIcon
                                    variant="subtle"
                                    color="blue"
                                    size="sm"
                                    radius="sm"
                                    onClick={(): void => onEdit(header)}
                                >
                                    <IconEdit size={iconSize} />
                                </ActionIcon>
                            </Group>
                        </Group>
                    </Card>
                ))}
            </div>
        </>
    );
};
