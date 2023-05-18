import React, { FC } from 'react';
import { ActionIcon, Group, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { iconSize } from '../../../../../../contstant';
import { THeader, THeaderType } from '../../../../../../types';

interface PanelProps {
    type: THeaderType
    onAdd: (initialValue: THeader) => void
}

export const Panel: FC<PanelProps> = ({ type, onAdd }) => {
    const handleOpenForm = () => {
        onAdd({
            id: nanoid(),
            key: '',
            value: '',
            type,
            isActive: true,
        });
    };

    return (
        <Group mb="xs" align="flex-start">
            <div>
                <Text size="sm" weight={500}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} headers
                </Text>
                <Text size="xs" c="dimmed">
                    These headers will be added to {type}s. If such a header already exists in the request,
                    it will be overwritten.
                </Text>
            </div>

            <ActionIcon
                color="blue"
                variant="filled"
                size="xs"
                title={`Add new ${type} header`}
                onClick={handleOpenForm}
            >
                <IconPlus size={iconSize} />
            </ActionIcon>
        </Group>
    );
};
