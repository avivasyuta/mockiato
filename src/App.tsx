import { useEffect, useState } from 'react';
import { AppShell, ColorSchemeScript, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { initStore } from '~/utils/storage';

import { AppNavbar } from './components/AppNavbar';
import { Headers } from './pages/Headers';
import { Logs } from './pages/Logs';
import { Mocks } from './pages/Mocks';
import { Network } from './pages/Network';
import { Settings } from './pages/Settings';
import { TRoute } from './types';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './App.css';

import classes from './App.module.css';
import { useNavBarToggler } from './hooks/useNavbarToggler';

export const App = () => {
  const [route, setRoute] = useState<TRoute>('mocks');
  const [isNavbarVisible, { toggle: toggleNavBar }] = useNavBarToggler();

  const onRouteChange = (newRoute: TRoute) => {
    setRoute(newRoute);

    toggleNavBar();
  };

  useEffect(() => {
    initStore();
  }, []);

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
              width: 220,
              breakpoint: 'xs',
              collapsed: { mobile: !isNavbarVisible },
            }}
            padding="md"
            classNames={{
              root: classes.root,
              navbar: classes.navbar,
              header: classes.header,
              main: classes.main,
            }}
          >
            <AppNavbar
              route={route}
              onRouteChange={onRouteChange}
            />

            <AppShell.Main>
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
