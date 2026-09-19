import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';
import { buildGroup, buildMock } from './fixtures';

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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

describe('Mocks page [Import and export]', () => {
  test('persists both mocks and groups after importing into an empty store', async () => {
    const user = userEvent.setup();
    setupChromeStorageMock();
    const { findByRole, findByText } = renderWithProviders(<Mocks />);

    // Wait for the initial (empty) store to load and the page to render.
    await findByRole('button', { name: 'Add Mock' });

    await user.click(await findByRole('button', { name: 'More actions' }));
    await user.click(await findByText('Import mocks'));

    const fileInput = await waitFor(() => {
      const input = document.querySelector('input[type="file"]');
      expect(input).not.toBeNull();
      return input as HTMLInputElement;
    });
    const file = new File([importJson], 'mocks.json', { type: 'application/json' });
    await user.upload(fileInput, file);

    const importButton = await findByRole('button', { name: 'Import' });
    await user.click(importButton);

    await findByText('Mocks have been successfully imported');
    expect(await findByText('Imported group')).toBeInTheDocument();

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

  test('downloads a JSON file with all current mocks and groups', async () => {
    const user = userEvent.setup();
    const group = buildGroup({ name: 'Auth mocks' });
    const groupedMock = buildMock({ url: 'https://example.com/grouped', groupId: group.id });
    const ungroupedMock = buildMock({ url: 'https://example.com/ungrouped' });
    setupChromeStorageMock({ mockGroups: [group], mocks: [groupedMock, ungroupedMock] });

    // ExportAction builds the download via `URL.createObjectURL(blob)` + a synthetic
    // anchor click, neither of which jsdom implements - stub just enough to capture the
    // Blob it produced and inspect its contents.
    const createObjectURL = vi.fn((_blob: Blob) => 'blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const { findByRole, findByText } = renderWithProviders(<Mocks />);
    await findByText(groupedMock.url);

    await user.click(await findByRole('button', { name: 'More actions' }));
    await user.click(await findByText('Export mocks'));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const [blob] = createObjectURL.mock.calls[0];
    expect(blob.type).toBe('application/json');

    const exported = JSON.parse(await blob.text());
    expect(exported).toEqual({
      mocks: [groupedMock, ungroupedMock],
      groups: [group],
    });

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });
});
