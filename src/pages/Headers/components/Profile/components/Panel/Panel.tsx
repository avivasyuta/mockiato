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
        <div>
            <Group align="center" spacing="0.7rem">
                <Text size="sm" weight={500}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} headers
                </Text>

                <ActionIcon
                    color="blue"
                    variant="gradient"
                    gradient={{ from: 'indigo', to: 'cyan' }}
                    size="xs"
                    title={`Add new ${type} header`}
                    onClick={handleOpenForm}
                >
                    <IconPlus size={iconSize} />
                </ActionIcon>
            </Group>

            <Text size="xs" c="dimmed">
                These headers will be added to {type}s. If such a header already exists in the request,
                it will be overwritten.
            </Text>
        </div>
    );
};
