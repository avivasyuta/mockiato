import React, { JSX, useMemo } from 'react';
import { Divider, Group, AppShell, NavLink, Text, ScrollArea, Button } from '@mantine/core';
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
    IconPlayerPlay,
    IconPlayerStop,
} from '@tabler/icons-react';
import { TRoute } from '~/types';
import { useStore } from '~/hooks/useStore';
import { useTabHost } from '~/hooks/useTab';
import manifest from '../../../public/manifest.json';
import styles from './AppNavbar.module.css';

type TMenuItem = {
    route: TRoute;
    name: string;
    icon: (props: TablerIconsProps) => JSX.Element;
};

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
    route: TRoute;
    onRouteChange: (route: TRoute) => void;
};

export const AppNavbar: React.FC<NavbarProps> = ({ onRouteChange, route }) => {
    const [settings, setSettings] = useStore('settings');
    const tabHost = useTabHost();

    const isEnabled = useMemo(() => {
        if (!tabHost) {
            return false;
        }
        return settings?.enabledHosts[tabHost];
    }, [settings?.enabledHosts]);

    const toggleMocking = async () => {
        if (!settings || !tabHost) {
            return;
        }

        if (settings.enabledHosts[tabHost]) {
            delete settings.enabledHosts[tabHost];
        } else {
            settings.enabledHosts[tabHost] = true;
        }

        await setSettings({
            ...settings,
        });
    };

    return (
        <AppShell.Navbar
            p="0"
            style={{ padding: 0 }}
        >
            <AppShell.Section
                grow
                component={ScrollArea}
            >
                {menu.map((link) => {
                    const Icon = link.icon;
                    return (
                        <NavLink
                            key={link.name}
                            label={link.name}
                            variant="light"
                            active={route === link.route}
                            onClick={() => onRouteChange(link.route)}
                            leftSection={<Icon size={16} />}
                            style={{
                                padding: '0.3rem 0.55rem',
                            }}
                        />
                    );
                })}

                <Group
                    p="xs"
                    justify="center"
                    gap="4px"
                >
                    <Button
                        variant="filled"
                        color={isEnabled ? 'red' : 'green'}
                        leftSection={isEnabled ? <IconPlayerStop size={22} /> : <IconPlayerPlay size={22} />}
                        fullWidth
                        onClick={toggleMocking}
                    >
                        {isEnabled ? 'Stop mocking' : 'Start mocking'}
                    </Button>

                    <Text
                        c="dimmed"
                        size="xs"
                    >
                        for {tabHost}
                    </Text>
                </Group>
            </AppShell.Section>

            <Divider variant="dotted" />

            <AppShell.Section p="xs">
                <Group justify="left">
                    <IconVersions
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href={`https://github.com/avivasyuta/mockiato/releases/tag/v${manifest.version}`}
                        c="dimmed"
                        className={styles.link}
                    >
                        Mockiato v{manifest.version}
                    </Text>
                </Group>

                <Group
                    justify="left"
                    mt="0.4rem"
                >
                    <IconBrandGithub
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/avivasyuta/mockiato"
                        c="dimmed"
                        className={styles.link}
                    >
                        View source code
                    </Text>
                </Group>

                <Group
                    justify="left"
                    mt="0.4rem"
                >
                    <IconCoin
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://www.buymeacoffee.com/mockiatoexW"
                        c="dimmed"
                        className={styles.link}
                    >
                        Support author
                    </Text>
                </Group>

                <Group
                    justify="left"
                    mt="0.4rem"
                >
                    <IconThumbUp
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://chrome.google.com/webstore/detail/mockiato/ilbkkhmnmnehcicempfpekgcpneeekao"
                        c="dimmed"
                        className={styles.link}
                    >
                        Rate extension
                    </Text>
                </Group>
            </AppShell.Section>
        </AppShell.Navbar>
    );
};
