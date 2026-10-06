import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';
import { emptyStore } from '~/utils/storeCore';

import { Mocks } from '../Mocks';
import { getMockCard } from './domHelpers';
import { buildMock } from './fixtures';

describe('Mocks page [Collapse mock actions setting]', () => {
  test('shows inline action buttons when the setting is disabled', async () => {
    const mock = buildMock({ url: 'https://example.com/inline-actions' });
    setupChromeStorageMock({
      mocks: [mock],
      settings: { ...emptyStore.settings, collapseMockActions: false },
    });
    const { findByText } = renderWithProviders(<Mocks />);
    await findByText(mock.url);

    const card = getMockCard(mock.url);
    expect(within(card).getByTestId('mock-row/clone')).toBeInTheDocument();
    expect(within(card).getByTestId('mock-row/edit')).toBeInTheDocument();
    expect(within(card).getByTestId('mock-row/delete')).toBeInTheDocument();
    expect(within(card).queryByTestId('mock-row/menu-trigger')).not.toBeInTheDocument();
  });

  test('hides actions under a menu and deletes the mock after confirmation when enabled', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/menu-actions' });
    setupChromeStorageMock({
      mocks: [mock],
      settings: { ...emptyStore.settings, collapseMockActions: true },
    });
    const { findByText, findByTestId } = renderWithProviders(<Mocks />);
    await findByText(mock.url);

    const card = getMockCard(mock.url);
    expect(within(card).queryByTestId('mock-row/clone')).not.toBeInTheDocument();
    expect(within(card).queryByTestId('mock-row/edit')).not.toBeInTheDocument();
    expect(within(card).queryByTestId('mock-row/delete')).not.toBeInTheDocument();

    await user.click(within(card).getByTestId('mock-row/menu-trigger'));
    expect(await findByTestId('mock-row/menu-clone')).toBeInTheDocument();
    expect(await findByTestId('mock-row/menu-edit')).toBeInTheDocument();

    await user.click(await findByTestId('mock-row/menu-delete'));
    expect((await getStore()).mocks).toHaveLength(1);

    await user.click(await findByTestId('confirm-delete-mock-button'));

    await waitFor(async () => {
      const store = await getStore();
      expect(store.mocks).toHaveLength(0);
    });
  });
});
