import { PropsWithChildren, ReactElement } from 'react';
import { AppShell, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { render, RenderResult } from '@testing-library/react';

// `~/components/Header` renders `<AppShell.Header>`, which needs an `AppShell` ancestor.
// `env="test"` short-circuits Mantine's Transition/Popover/Tabs mounted-state logic that
// otherwise depends on floating-ui positioning and CSS transition events jsdom can't produce
// (Popover/Select/Menu dropdowns would stay `display: none` forever without it).
const Providers = ({ children }: PropsWithChildren) => (
  <MantineProvider env="test">
    <ModalsProvider>
      <Notifications />
      <AppShell>{children}</AppShell>
    </ModalsProvider>
  </MantineProvider>
);

export const renderWithProviders = (element: ReactElement): RenderResult => render(element, { wrapper: Providers });
