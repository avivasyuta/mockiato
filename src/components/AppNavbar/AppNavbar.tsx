import React, { useCallback, useContext } from 'react';
import {
    ActionIcon,
    Divider,
    Group,
    Navbar,
    Text,
    NavLink,
} from '@mantine/core';
import {
    IconBrandGithub,
    IconPlaylistAdd,
    IconShadow,
    IconVersions,
    IconNotebook,
} from '@tabler/icons';
import { MockFormContext } from '../../context/MockFormContext';
import manifest from '../../../public/manifest.json';
import { TRoute } from '../../types';

type NavbarProps = {
    route: TRoute
    onRouteChange: (route: TRoute) => void
}

export const AppNavbar: React.FC<NavbarProps> = ({ onRouteChange, route }) => {
    const dispatch = useContext(MockFormContext);

    const handleOpenMockForm = useCallback(() => {
        dispatch({ type: 'open' });
    }, []);

    return (
        <Navbar p="sm" width={{ base: 300 }}>
            <Navbar.Section>
                <Group position="apart">
                    <Text size="sm">Mockiato</Text>

                    {route === 'mocks' && (
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            radius="sm"
                            title="Add new mock"
                            onClick={handleOpenMockForm}
                        >
                            <IconPlaylistAdd />
                        </ActionIcon>
                    )}
                </Group>
            </Navbar.Section>

            <Divider my="sm" variant="dotted" />

            <Navbar.Section grow>
                <NavLink
                    label="Mocks"
                    variant="light"
                    active={route === 'mocks'}
                    onClick={() => onRouteChange('mocks')}
                    icon={<IconShadow size={16} stroke={1.5} />}
                />
                <NavLink
                    label="Logs"
                    variant="light"
                    active={route === 'logs'}
                    onClick={() => onRouteChange('logs')}
                    color="orange"
                    icon={<IconNotebook size={16} stroke={1.5} />}
                />
            </Navbar.Section>

            <Divider my="sm" variant="dotted" />

            <Navbar.Section>
                <Group position="left">
                    <IconVersions size={16} color="gray" />
                    <Text size="xs" color="gray">
                        v
                        {manifest.version}
                    </Text>
                </Group>

                <Group position="left" mt="xs">
                    <IconBrandGithub size={16} color="gray" />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/avivasyuta/mockiato"
                        color="gray"
                    >
                        View source code
                    </Text>
                </Group>
            </Navbar.Section>
        </Navbar>
    );
};
