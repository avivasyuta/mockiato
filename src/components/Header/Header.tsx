import React, { FC, ReactNode } from 'react';
import { Group, AppShell, Burger } from '@mantine/core';
import { useNavBarToggler } from '~/hooks/useNavbarToggler';

export const Header: FC<React.PropsWithChildren & { title: ReactNode }> = ({ title, children }) => {
    const [isNavbarVisible, { toggle }] = useNavBarToggler();

    return (
        <AppShell.Header>
            <Group
                h="100%"
                px="md"
                justify="space-between"
            >
                <Group h="100%">
                    <Burger
                        opened={isNavbarVisible}
                        onClick={toggle}
                        hiddenFrom="xs"
                        size="xs"
                    />
                    {title}
                </Group>
                {children}
            </Group>
        </AppShell.Header>
    );
};
