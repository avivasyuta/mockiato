import React, { JSX, useMemo } from 'react';
import { AppShell, Button, Divider, Group, NavLink, ScrollArea, Switch, Text } from '@mantine/core';
import {
    IconBrandGithub,
    IconCodeMinus,
    IconCoin,
    IconExternalLink,
    IconNotebook,
    IconSettings2,
    IconShadow,
    IconThumbUp,
    IconVersions,
    IconWifi,
    IconBug,
    TablerIconsProps,
} from '@tabler/icons-react';
import { TRoute } from '~/types';
import { useStore } from '~/hooks/useStore';
import { useTabHost } from '~/hooks/useTab';
import { isStandaloneTab } from '~/utils/runMode';
import manifest from '../../../public/manifest.json';
import styles from './AppNavbar.module.css';

type TMenuItem = {
    route: TRoute;
    name: string;
    icon: (props: TablerIconsProps) => JSX.Element;
};

// Routes that require the context of an inspected page (current host).
// Hidden when the app runs as a standalone browser tab.
const hostScopedRoutes: TRoute[] = ['network', 'logs'];

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
    const standalone = isStandaloneTab();

    const menuItems = useMemo(
        () => (standalone ? menu.filter((link) => !hostScopedRoutes.includes(link.route)) : menu),
        [standalone],
    );

    const handleOpenInTab = () => {
        const url = chrome?.runtime?.getURL?.('index.html');

        if (!url) {
            return;
        }

        if (chrome?.tabs?.create) {
            chrome.tabs.create({ url });
        } else {
            window.open(url, '_blank');
        }
    };

    const isEnabled = useMemo(() => {
        if (!tabHost) {
            return false;
        }
        return settings?.enabledHosts[tabHost] ?? false;
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
            <AppShell.Section component={ScrollArea}>
                {menuItems.map((link) => {
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
            </AppShell.Section>

            {!standalone && (
                <>
                    <Divider variant="dotted" />

                    <AppShell.Section p="xs">
                        <Button
                            fullWidth
                            variant="light"
                            size="xs"
                            color="gray"
                            leftSection={<IconExternalLink size={14} />}
                            onClick={handleOpenInTab}
                        >
                            Open in a browser tab
                        </Button>
                    </AppShell.Section>
                </>
            )}

            <Divider variant="dotted" />

            <AppShell.Section grow>
                {!standalone && (
                    <Group
                        p="xs"
                        justify="center"
                        gap="4px"
                    >
                        <Switch
                            size="lg"
                            color="green"
                            onLabel="MOCKIATO ENABLED"
                            offLabel="MOCKIATO DISABLED"
                            radius="sm"
                            checked={isEnabled}
                            onChange={toggleMocking}
                            styles={{
                                root: {
                                    width: '100%',
                                },
                                track: {
                                    width: '100%',
                                },
                                trackLabel: {
                                    padding: '0',
                                    width: '100%',
                                    margin: '0',
                                },
                            }}
                        />

                        <Text
                            c="dimmed"
                            size="xs"
                        >
                            for {tabHost}
                        </Text>
                    </Group>
                )}
            </AppShell.Section>

            <Divider variant="dotted" />

            <AppShell.Section p="xs">
                <Group
                    justify="left"
                    gap="12px"
                >
                    <IconVersions
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="sm"
                        variant="link"
                        component="a"
                        target="_blank"
                        href={`https://github.com/avivasyuta/mockiato/releases/tag/v${manifest.version}`}
                        c="dimmed"
                        className={styles.link}
                    >
                        Version {manifest.version}
                    </Text>
                </Group>

                <Group
                    justify="left"
                    mt="0.4rem"
                    gap="12px"
                >
                    <IconBrandGithub
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="sm"
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
                    gap="12px"
                >
                    <IconCoin
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="sm"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/sponsors/avivasyuta"
                        c="dimmed"
                        className={styles.link}
                    >
                        Support author
                    </Text>
                </Group>

                <Group
                    justify="left"
                    mt="0.4rem"
                    gap="12px"
                >
                    <IconThumbUp
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="sm"
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

                <Group
                    justify="left"
                    mt="0.4rem"
                    gap="12px"
                >
                    <IconBug
                        size={16}
                        color="gray"
                    />
                    <Text
                        size="sm"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/avivasyuta/mockiato/issues"
                        c="dimmed"
                        className={styles.link}
                    >
                        Report a bug
                    </Text>
                </Group>
            </AppShell.Section>
        </AppShell.Navbar>
    );
};
