import React from 'react';
import {
    Divider,
    Group,
    Navbar,
    NavLink,
    Text,
} from '@mantine/core';
import {
    IconBrandGithub,
    IconCoin,
    IconNotebook,
    IconSettings2,
    IconShadow,
    IconVersions,
} from '@tabler/icons-react';
import manifest from '../../../public/manifest.json';
import { TRoute } from '../../types';

type NavbarProps = {
    route: TRoute
    onRouteChange: (route: TRoute) => void
}

export const AppNavbar: React.FC<NavbarProps> = ({ onRouteChange, route }) => (
    <Navbar p="sm" width={{ base: 250 }}>
        <Navbar.Section>
            <Group position="apart" align="end">
                <Group align="end">
                    <img src="mockiato-128.png" alt="Mockiato" width="32" />
                    <Text
                        size="sm"
                        variant="gradient"
                        gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                    >
                        Mockiato
                    </Text>
                </Group>
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
                icon={<IconNotebook size={16} stroke={1.5} />}
            />
            <NavLink
                label="Settings"
                variant="light"
                active={route === 'settings'}
                onClick={() => onRouteChange('settings')}
                icon={<IconSettings2 size={16} stroke={1.5} />}
            />
        </Navbar.Section>

        <Divider my="sm" variant="dotted" />

        <Navbar.Section>
            <Group position="left">
                <IconVersions size={16} color="gray" />
                <Text
                    size="xs"
                    variant="link"
                    component="a"
                    target="_blank"
                    href={`https://github.com/avivasyuta/mockiato/releases/tag/v${manifest.version}`}
                    color="dimmed"
                >
                    Version {manifest.version}
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
                    color="dimmed"
                >
                    View source code
                </Text>
            </Group>

            <Group position="left" mt="xs">
                <IconCoin size={16} color="gray" />
                <Text
                    size="xs"
                    variant="link"
                    component="a"
                    target="_blank"
                    href="https://www.buymeacoffee.com/mockiatoexW"
                    color="dimmed"
                >
                    Support author
                </Text>
            </Group>
        </Navbar.Section>
    </Navbar>
);
