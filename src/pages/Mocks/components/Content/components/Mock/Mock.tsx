import React, { FC } from 'react';
import { ActionIcon, Group, Switch, Text, Tooltip, useMantineTheme } from '@mantine/core';
import { IconEdit, IconCopy, IconInfoCircle, IconTrash, IconRegex } from '@tabler/icons-react';
import { HttpMethod } from '../../../../../../components/HttpMethod';
import { HttpStatus } from '../../../../../../components/HttpStatus';
import { Card } from '../../../../../../components/Card';
import { TMock } from '../../../../../../types';
import { iconSize } from '../../../../../../contstant';
import styles from './Mock.module.css';

interface MockProps {
    mock: TMock;
    onEditClick: (mock: TMock) => void;
    onCopyClick: (mock: TMock) => void;
    onChange: (mock: TMock) => void;
    onDelete: (mockId: string) => void;
}

export const Mock: FC<MockProps> = ({ mock, onDelete, onChange, onCopyClick, onEditClick }) => {
    const theme = useMantineTheme();

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
        <Card
            key={mock.id}
            p="0.34rem 0.6rem"
        >
            <Group gap="xs">
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
                        <Tooltip
                            label={mock.comment}
                            withArrow
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
    );
};
