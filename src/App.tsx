import React, {
    useEffect,
    useMemo,
    useReducer,
    useState,
} from 'react';
import {
    ColorScheme,
    ColorSchemeProvider,
    MantineProvider,
    Global,
    Box,
    Group,
} from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks';
import { Mocks } from './pages/Mocks';
import { Logs } from './pages/Logs';
import { Settings } from './pages/Settings';
import { AppContext } from './context/AppContext';
import { MockForm } from './components/MockForm';
import {
    TMockFormAction,
    TMockFormState,
    TRoute,
    TStore,
} from './types';
import { AppNavbar } from './components/AppNavbar';
import { useStorage } from './hooks/useStorage';
import { STORE_KEY } from './contstant';

const initialMockFormState: TMockFormState = {
    isOpened: false,
    mock: undefined,
};

const mockFormReducer = (state: TMockFormState, action: TMockFormAction): TMockFormState => {
    switch (action.type) {
    case 'open':
        return { isOpened: true, mock: action.payload };
    case 'close':
        return { isOpened: false, mock: undefined };
    default:
        return state;
    }
};

export const App = () => {
    const [mockForm, dispatch] = useReducer(mockFormReducer, initialMockFormState);
    const isPreferredDarkTheme = useMediaQuery('(prefers-color-scheme: dark)');
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const [route, setRoute] = useState<TRoute>('mocks');
    const [store, setStore] = useStorage<TStore>(STORE_KEY, { mocks: [], logs: [] });

    const toggleColorScheme = () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');

    useEffect(() => {
        setColorScheme(isPreferredDarkTheme ? 'dark' : 'light');
    }, [isPreferredDarkTheme]);

    const context = useMemo(() => ({
        dispatchMockForm: dispatch,
        store,
        setStore,
    }), [store]);

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider position="bottom-center">
                    <AppContext.Provider value={context}>
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
                                {route === 'mocks' && (
                                    <>
                                        <Mocks />
                                        <MockForm
                                            mock={mockForm.mock}
                                            isOpen={mockForm.isOpened}
                                        />
                                    </>
                                )}
                                {route === 'logs' && <Logs />}
                                {route === 'settings' && <Settings />}
                            </Box>
                        </Group>
                    </AppContext.Provider>
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    );
};
