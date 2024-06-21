import React, { FC } from 'react';
import { Group, AppShell, Burger } from '@mantine/core';
import { useNavBarToggler } from '~/hooks/useNavbarToggler';

export const Header: FC<React.PropsWithChildren > = ({ children }) => {
    const [isNavbarVisible, {toggle}] = useNavBarToggler();

    return (
        <AppShell.Header>
            <Group h="100%" px="md" justify="space-between">
                <Burger opened={isNavbarVisible} onClick={toggle} hiddenFrom="xs" size="sm" />
                {children}
            </Group>
        </AppShell.Header>
    );
};
