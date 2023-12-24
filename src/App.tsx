import React, { useState } from 'react';
import { AppShell, ColorSchemeScript, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { Mocks } from './pages/Mocks';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { Headers } from './pages/Headers';
import { Network } from './pages/Network';
import { TRoute } from './types';
import { AppNavbar } from './components/AppNavbar';
import '@mantine/core/styles.css';
import './App.css';

export const App = () => {
    const [route, setRoute] = useState<TRoute>('mocks');

    return (
        <>
            <ColorSchemeScript defaultColorScheme="auto" />
            <MantineProvider defaultColorScheme="auto">
                <ModalsProvider>
                    <Notifications position="bottom-center" />

                    <AppShell
                        layout="alt"
                        header={{ height: 40 }}
                        navbar={{
                            width: 200,
                            breakpoint: 'sm',
                        }}
                        padding="md"
                    >
                        <AppNavbar
                            route={route}
                            onRouteChange={setRoute}
                        />

                        <AppShell.Main
                            style={{
                                header: {
                                    height: '35px',
                                },
                            }}
                        >
                            {route === 'mocks' && <Mocks />}
                            {route === 'headers' && <Headers />}
                            {route === 'logs' && <Logs />}
                            {route === 'settings' && <Settings />}
                            {route === 'network' && <Network />}
                        </AppShell.Main>
                    </AppShell>
                </ModalsProvider>
            </MantineProvider>
        </>
    );
};
