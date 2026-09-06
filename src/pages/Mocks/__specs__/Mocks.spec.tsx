// @vitest-environment jsdom
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { AppShell, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { getStore } from '~/utils/storage';
import { Mocks } from '~/pages/Mocks';

// jsdom doesn't implement these, but Mantine's Menu/Modal popovers need them.
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

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Simulates real chrome.storage.local latency, matching the timing that
// exposed the race condition in issue #59.
const setupChromeStorageMock = () => {
  let backingStore: Record<string, unknown> = {};

  (global as unknown as { chrome: unknown }).chrome = {
    storage: {
      local: {
        get: vi.fn(async (key: string) => {
          await delay(10);
          return { [key]: backingStore[key] };
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          await delay(10);
          backingStore = { ...backingStore, ...items };
        }),
      },
      onChanged: {
        addListener: vi.fn(),
      },
    },
  };
};

const renderMocks = () =>
  render(
    <MantineProvider>
      <Notifications />
      <AppShell header={{ height: 35 }}>
        <AppShell.Main>
          <Mocks />
        </AppShell.Main>
      </AppShell>
    </MantineProvider>,
  );

const importJson = JSON.stringify({
  groups: [{ id: 'group_1', name: 'Imported group' }],
  mocks: [
    {
      id: 'mock_1',
      url: '/imported-url',
      urlType: 'url',
      httpMethod: 'GET',
      httpStatusCode: 200,
      delay: 0,
      responseType: 'json',
      responseHeaders: [],
      isActive: true,
      groupId: 'group_1',
    },
  ],
});

describe('Mocks page - importing mocks and groups', () => {
  beforeEach(() => {
    setupChromeStorageMock();
  });

  test('persists both mocks and groups after importing into an empty store (issue #59)', async () => {
    const user = userEvent.setup();
    renderMocks();

    // Wait for the initial (empty) store to load and the page to render.
    await screen.findByRole('button', { name: 'Add Mock' });

    await user.click(screen.getByRole('button', { name: 'More actions' }));
    await user.click(await screen.findByText('Import mocks'));

    const fileInput = await waitFor(() => {
      const input = document.querySelector('input[type="file"]');
      expect(input).not.toBeNull();
      return input as HTMLInputElement;
    });
    const file = new File([importJson], 'mocks.json', { type: 'application/json' });
    await user.upload(fileInput, file);

    const importButton = await screen.findByRole('button', { name: 'Import' });
    await user.click(importButton);

    await screen.findByText('Mocks have been successfully imported');
    expect(await screen.findByText('Imported group')).toBeInTheDocument();

    await waitFor(async () => {
      const store = await getStore();
      expect(store.mockGroups).toEqual([{ id: 'group_1', name: 'Imported group' }]);
      expect(store.mocks).toHaveLength(1);
      expect(store.mocks[0]).toMatchObject({ id: 'mock_1', groupId: 'group_1' });
    });

    // Let the 'storage' event refetches triggered by the writes above settle
    // before the test unmounts the component, so they don't reject afterwards.
    await delay(30);
  });
});
