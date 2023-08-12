import React from 'react';
import {
    Divider,
    Group,
    Navbar,
    NavLink,
    Text, useMantineTheme,
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
    IconThumbUp,
    IconWifi,
} from '@tabler/icons-react';
import manifest from '../../../public/manifest.json';
import { TRoute } from '../../types';
import styles from './AppNavbar.module.css';

type TMenuItem = {
    route: TRoute
    name: string
    icon: (props: TablerIconsProps) => JSX.Element
}

const menu: TMenuItem[] = [
    {
        route: 'mocks',
        name: 'Response Mocks',
        icon: IconShadow,
    },
    {
        route: 'headers',
        name: 'Request Headers',
        icon: IconCodeMinus,
    },
    {
        route: 'network',
        name: 'Network',
        icon: IconWifi,
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

export const AppNavbar: React.FC<NavbarProps> = ({ onRouteChange, route }) => {
    const theme = useMantineTheme();

    return (
        <Navbar
            width={{ base: 200 }}
            bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#ffffff'}
            zIndex={1}
        >
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
                            className={styles.menuItem}
                            icon={<Icon size={16} stroke={1.5} />}
                        />
                    );
                })}
            </Navbar.Section>

            <Divider variant="dotted" />

            <Navbar.Section p="xs">
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
                        Mockiato v{manifest.version}
                    </Text>
                </Group>

                <Group position="left" mt="0.4rem">
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

                <Group position="left" mt="0.4rem">
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

                <Group position="left" mt="0.4rem">
                    <IconThumbUp size={16} color="gray" />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://chrome.google.com/webstore/detail/mockiato/ilbkkhmnmnehcicempfpekgcpneeekao"
                        color="dimmed"
                    >
                        Rate extension
                    </Text>
                </Group>
            </Navbar.Section>
        </Navbar>
    );
};
