// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import '@testing-library/jest-dom/vitest';

import { AppShell, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { Settings } from '~/pages/Settings';
import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { HttpMethodType, TStore } from '~/types';
import { getStore } from '~/utils/storage';
import { emptyStore } from '~/utils/storeCore';

// jsdom doesn't implement these, but Mantine's Modal popovers need them.
window.matchMedia =
  window.matchMedia ||
  (((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia);
class MockObserver {
  observe = () => {};

  unobserve = () => {};

  disconnect = () => {};

  takeRecords = () => [];
}

window.ResizeObserver = window.ResizeObserver || (MockObserver as unknown as typeof ResizeObserver);
window.IntersectionObserver = window.IntersectionObserver || (MockObserver as unknown as typeof IntersectionObserver);

const seededStore: TStore = {
  ...emptyStore,
  mocks: [
    {
      id: 'mock_1',
      url: '/some-url',
      urlType: 'url',
      httpMethod: HttpMethodType.GET,
      httpStatusCode: 200,
      delay: 0,
      responseType: 'json',
      responseHeaders: [],
      isActive: true,
    },
  ],
  mockGroups: [{ id: 'group_1', name: 'Group' }],
  logs: [
    {
      url: '/some-url',
      method: 'GET',
      date: new Date().toISOString(),
      host: 'example.com',
      mock: {
        id: 'mock_1',
        url: '/some-url',
        urlType: 'url',
        httpMethod: HttpMethodType.GET,
        httpStatusCode: 200,
        delay: 0,
        responseType: 'json',
        responseHeaders: [],
        isActive: true,
      },
    },
  ],
  headersProfiles: {
    profile_1: {
      id: 'profile_1',
      name: 'Profile',
      status: 'enabled',
      lastActive: true,
      headers: [],
    },
  },
  network: [
    {
      host: 'example.com',
      date: new Date().toISOString(),
      request: { url: '/some-url', method: HttpMethodType.GET },
      response: { type: 'json', headers: [], httpStatusCode: 200 },
    },
  ],
  settings: {
    showNotifications: true,
    showActiveStatus: true,
    enabledHosts: {},
    showMobileNavBar: false,
    commentDisplayMode: 'tooltip',
    displayHttpMethodInline: false,
  },
};

const renderSettings = () =>
  render(
    <MantineProvider>
      <ModalsProvider>
        <Notifications />
        <AppShell header={{ height: 35 }}>
          <AppShell.Main>
            <Settings />
          </AppShell.Main>
        </AppShell>
      </ModalsProvider>
    </MantineProvider>,
  );

describe('Settings page - erasing data', () => {
  beforeEach(() => {
    setupChromeStorageMock(seededStore, { delayMs: 10 });
  });

  afterEach(() => {
    cleanup();
  });

  test('erasing network logs clears them from the store', async () => {
    const user = userEvent.setup();
    renderSettings();

    const eraseButton = await screen.findByTestId('erase-network-logs-button');
    expect(eraseButton).toBeEnabled();
    await user.click(eraseButton);

    await user.click(await screen.findByTestId('confirm-erase-button'));

    await waitFor(async () => {
      const store = await getStore();
      expect(store.network).toEqual([]);
      expect(eraseButton).toBeDisabled();
    });
  });

  test('erasing mocks clears mocks and mock groups from the store', async () => {
    const user = userEvent.setup();
    renderSettings();

    const eraseButton = await screen.findByTestId('erase-mocks-button');
    expect(eraseButton).toBeEnabled();
    await user.click(eraseButton);

    await user.click(await screen.findByTestId('confirm-erase-button'));

    await waitFor(async () => {
      const store = await getStore();
      expect(store.mocks).toEqual([]);
      expect(store.mockGroups).toEqual([]);
      expect(eraseButton).toBeDisabled();
    });
  });

  test('erasing logs clears intercepted request logs from the store', async () => {
    const user = userEvent.setup();
    renderSettings();

    const eraseButton = await screen.findByTestId('erase-logs-button');
    expect(eraseButton).toBeEnabled();
    await user.click(eraseButton);

    await user.click(await screen.findByTestId('confirm-erase-button'));

    await waitFor(async () => {
      const store = await getStore();
      expect(store.logs).toEqual([]);
      expect(eraseButton).toBeDisabled();
    });
  });

  test('erasing headers profiles clears them from the store', async () => {
    const user = userEvent.setup();
    renderSettings();

    const eraseButton = await screen.findByTestId('erase-headers-button');
    expect(eraseButton).toBeEnabled();
    await user.click(eraseButton);

    await user.click(await screen.findByTestId('confirm-erase-button'));

    await waitFor(async () => {
      const store = await getStore();
      expect(store.headersProfiles).toEqual({});
      expect(eraseButton).toBeDisabled();
    });
  });
});
