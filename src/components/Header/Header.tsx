import React, { FC } from 'react';
import { Group, AppShell } from '@mantine/core';

export const Header: FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
                {children}
            </Group>
        </AppShell.Header>
    );
};
