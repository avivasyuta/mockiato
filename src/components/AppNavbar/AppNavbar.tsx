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
    IconCodeMinus,
    TablerIconsProps,
} from '@tabler/icons-react';
import manifest from '../../../public/manifest.json';
import { TRoute } from '../../types';

type TMenuItem = {
    route: TRoute
    name: string
    icon: (props: TablerIconsProps) => JSX.Element
}

const menu: TMenuItem[] = [
    {
        route: 'mocks',
        name: 'Mocks',
        icon: IconShadow,
    },
    {
        route: 'headers',
        name: 'Headers',
        icon: IconCodeMinus,
    },
    {
        route: 'logs',
        name: 'Logs',
        icon: IconNotebook,
    },
    {
        route: 'settings',
        name: 'Settings',
        icon: IconSettings2,
    },
];

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
            {menu.map((link) => {
                const Icon = link.icon;
                return (
                    <NavLink
                        key={link.name}
                        label={link.name}
                        variant="light"
                        active={route === link.route}
                        onClick={() => onRouteChange(link.route)}
                        icon={<Icon size={16} stroke={1.5} />}
                    />
                );
            })}
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
