import React, { FC } from 'react';
import {
    ActionIcon,
    Badge,
    Group,
    Paper,
    Switch,
    Text,
    Tooltip,
    useMantineTheme,
} from '@mantine/core';
import {
    IconEdit,
    IconCopy,
    IconInfoCircle,
    IconTrash,
} from '@tabler/icons-react';
import { HttpMethod } from '../../../../components/HttpMethod';
import { TMock } from '../../../../types';
import styles from './Mock.module.css';

interface MockProps {
    mock: TMock
    onEditClick: (mock: TMock) => void
    onCopyClick: (mock: TMock) => void
    onChange: (mock: TMock) => void
    onDelete: (mockId: string) => void
}

const iconSize = '0.95rem';

const getStatusCodeColor = (code: number): string => {
    if (code >= 100 && code < 200) {
        return 'cyan';
    } if (code >= 200 && code < 300) {
        return 'green';
    } if (code >= 300 && code < 400) {
        return 'gray';
    } if (code >= 400 && code < 500) {
        return 'yellow';
    }
    return 'red';
};

export const Mock: FC<MockProps> = ({
    mock,
    onDelete,
    onChange,
    onCopyClick,
    onEditClick,
}) => {
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
        <Paper
            shadow="sm"
            radius="md"
            py="xs"
            px="md"
            key={mock.id}
        >
            <Group>
                <Switch
                    onLabel="ON"
                    offLabel="OFF"
                    size="sm"
                    checked={mock.isActive}
                    onChange={handleChangeStatus}
                />

                <div className={styles.method}>
                    <HttpMethod method={mock.httpMethod} />
                </div>

                <Group align="center" className={styles.url}>
                    <Text size="xs" title="URL">{mock.url}</Text>
                    {mock.comment && (
                        <Tooltip
                            label={mock.comment}
                            withArrow
                            position="bottom"
                            className={styles.comment}
                        >
                            <span>
                                <IconInfoCircle size={16} color={theme.colors.blue[4]} />
                            </span>
                        </Tooltip>
                    )}
                </Group>

                <Group className={styles.code}>
                    <Text
                        size="xs"
                        color={theme.colors.gray[6]}
                    >
                        Status code
                    </Text>
                    <Badge
                        size="xs"
                        variant="outline"
                        color={getStatusCodeColor(mock.httpStatusCode)}
                        radius="sm"
                        title="HTTP status code"
                    >
                        {mock.httpStatusCode}
                    </Badge>
                </Group>

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
        </Paper>
    );
};
