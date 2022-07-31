import React, { useCallback, useEffect, useReducer, useState } from 'react'
import { ColorScheme, ColorSchemeProvider, MantineProvider, Global, Box, Drawer, Group } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications';
import { useMediaQuery } from '@mantine/hooks'
import { Mocks } from './components/Mocks'
import { MockFormContext } from './context/MockFormContext'
import { MockForm } from './components/MockForm';
import { TMockFormAction, TMockFormState } from './types';
import { AppNavbar } from './components/AppNavbar';

const initialMockFormState: TMockFormState = {
    isOpened: false,
    mock: undefined
}

const mockFormReducer = (state: TMockFormState, action: TMockFormAction): TMockFormState => {
    switch (action.type) {
        case 'open':
            return { isOpened: true, mock: action.payload }
        case 'close':
            return { isOpened: false, mock: undefined }
        default:
            return state
    }
}

export const App = () => {
    const [mockForm, dispatch] = useReducer(mockFormReducer, initialMockFormState)
    const isPreferredDarkTheme = useMediaQuery('(prefers-color-scheme: dark)')
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light')

    const handleCloseForm = useCallback(() => {
        dispatch({ type: 'close' })
    }, [])

    const toggleColorScheme = (value: ColorScheme) => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')

    useEffect(() => {
        setColorScheme(isPreferredDarkTheme ? 'dark' : 'light')
    }, [isPreferredDarkTheme])

    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
            <MantineProvider theme={{colorScheme}} withGlobalStyles withNormalizeCSS>
                <NotificationsProvider position='bottom-center'>
                    <MockFormContext.Provider value={dispatch}>
                        <Global
                            styles={(theme) => ({
                                body: {
                                    ...theme.fn.fontStyles(),
                                    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
                                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
                                    minHeight: '100vh',
                                },
                            })}
                        />

                        <Group
                            position='left'
                            align='flex-start'
                            sx={{ gridColumnGap: '0' }}
                        >
                            <AppNavbar />

                            <Box
                                p='md'
                                sx={{
                                    flex: '1',
                                    height: '100vh',
                                    overflowY: 'auto',
                                }}
                            >
                                <Mocks />
                            </Box>
                        </Group>

                        <MockForm
                            mock={mockForm.mock}
                            isOpen={mockForm.isOpened}
                            onClose={handleCloseForm}
                        />
                    </MockFormContext.Provider>
                </NotificationsProvider>
            </MantineProvider>
        </ColorSchemeProvider>
    )
}
