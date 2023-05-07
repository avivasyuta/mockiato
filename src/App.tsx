import React, { useEffect, useState } from 'react';
import {
    ColorScheme,
    ColorSchemeProvider,
    MantineProvider,
    Global,
    Box,
    Group,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { Mocks } from './pages/Mocks';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { Headers } from './pages/Headers';
import { TRoute } from './types';
import { AppNavbar } from './components/AppNavbar';

export const App = () => {
    const isPreferredDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [route, setRoute] = useState<TRoute>('mocks');

    useEffect(() => {
        setColorScheme(isPreferredDarkTheme ? 'dark' : 'light');
    }, [isPreferredDarkTheme]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => null}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <Notifications position="bottom-center" />
                <Global
                    styles={(theme) => ({
                        body: {
                            ...theme.fn.fontStyles(),
                            backgroundColor: theme.colorScheme === 'dark'
                                ? theme.colors.dark[8]
                                : theme.colors.gray[1],
                            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                            minHeight: '100vh',
                        },
                    })}
                />

                <Group
                    position="left"
                    align="flex-start"
                    sx={{ gridColumnGap: '0' }}
                >
                    <AppNavbar
                        route={route}
                        onRouteChange={setRoute}
                    />

                    <Box
                        p="md"
                        sx={{
                            flex: '1',
                            height: '100vh',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {route === 'mocks' && <Mocks />}
                        {route === 'headers' && <Headers />}
                        {route === 'logs' && <Logs />}
                        {route === 'settings' && <Settings />}
                    </Box>
                </Group>
            </MantineProvider>
        </ColorSchemeProvider>
    );
};
