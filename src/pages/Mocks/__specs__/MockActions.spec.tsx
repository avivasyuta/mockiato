import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';
import { cloneMock, deleteMock, getMockCard, getMockStatusSwitch } from './domHelpers';
import { buildMock } from './fixtures';

describe('Mocks page [Mock actions]', () => {
  test('toggles a mock on and off via its switch', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/toggle', isActive: true });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByText } = renderWithProviders(<Mocks />);
    await findByText(mock.url);

    const toggleSwitch = getMockStatusSwitch(mock.url);
    expect(toggleSwitch).toBeChecked();

    await user.click(toggleSwitch);

    expect(toggleSwitch).not.toBeChecked();
    const store = await getStore();
    expect(store.mocks[0]).toMatchObject({ id: mock.id, isActive: false });

    await user.click(toggleSwitch);

    expect(toggleSwitch).toBeChecked();
    const store2 = await getStore();
    expect(store2.mocks[0]).toMatchObject({ id: mock.id, isActive: true });
  });

  test('clones a mock into a new mock with its own id', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/original', name: 'Original', httpStatusCode: 204 });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByTestId, findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    await cloneMock(user, mock.url);

    // the clone form opens pre-filled with the source mock's values
    expect(await findByTestId('mock-form/url-input/value')).toHaveValue(mock.url);

    const urlInput = await findByTestId('mock-form/url-input/value');
    await user.clear(urlInput);
    await user.type(urlInput, 'https://example.com/cloned');

    await user.click(await findByTestId('mock-form/save'));

    expect(await findByText('Mock data was saved')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(2);
    const clone = store.mocks.find((m) => m.url === 'https://example.com/cloned');
    expect(clone).toBeDefined();
    expect(clone?.id).not.toBe(mock.id);
    expect(clone).toMatchObject({ name: 'Original', httpStatusCode: 204 });

    expect(await findByText(mock.url)).toBeInTheDocument();
    expect(await findByText('https://example.com/cloned')).toBeInTheDocument();
  });

  test('deletes a mock on double click', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/to-delete' });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByText, queryByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);

    await deleteMock(user, mock.url);

    expect(await findByText('Mock was deleted')).toBeInTheDocument();
    expect(queryByText(mock.url)).not.toBeInTheDocument();
    expect(await findByText('No mocks to show')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(0);
  });

  test('a single click does not delete a mock', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/keep-me' });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    const card = getMockCard(mock.url);
    await user.click(within(card).getByTestId('mock-row/delete'));

    expect(await findByText(mock.url)).toBeInTheDocument();
    const store = await getStore();
    expect(store.mocks).toHaveLength(1);
  });
});
