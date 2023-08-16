import React, { useState } from 'react';
import {
    Box, ColorSchemeProvider, Global, Group, MantineProvider,
} from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { useColorScheme } from '@mantine/hooks';
import { ModalsProvider } from '@mantine/modals';
import { Mocks } from './pages/Mocks';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { Headers } from './pages/Headers';
import { Network } from './pages/Network';
import { TRoute } from './types';
import { AppNavbar } from './components/AppNavbar';

export const App = () => {
    const colorScheme = useColorScheme();
    const [route, setRoute] = useState<TRoute>('mocks');

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={() => null}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <ModalsProvider>
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
                            {route === 'network' && <Network />}
                        </Box>
                    </Group>
                </ModalsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
};
