import React, { FC } from 'react';
import {
    Box, ColorSwatch, Group, useMantineTheme,
} from '@mantine/core';
import { THeadersProfileStatus } from '../../../../../../types';

interface ProfileLabelProps {
    name: string
    status: THeadersProfileStatus
}

export const ProfileLabel: FC<ProfileLabelProps> = ({ name, status }) => {
    const theme = useMantineTheme();

    return (
        <Group
            noWrap
            title={`«${name}» profile is ${status}`}
            spacing="0.4rem"
        >
            <Box>{name}</Box>
            <ColorSwatch
                color={status === 'enabled' ? theme.colors.green[6] : theme.colors.gray[6]}
                size={8}
            />
        </Group>
    );
};
