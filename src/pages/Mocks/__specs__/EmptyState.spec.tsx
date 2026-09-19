import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';

import { Mocks } from '../Mocks';

describe('Mocks page [Empty state]', () => {
  test('shows the empty state and an "Add Mock" button when there are no mocks or groups', async () => {
    setupChromeStorageMock();
    const { findByText, findByRole } = renderWithProviders(<Mocks />);

    expect(await findByText('No mocks to show')).toBeInTheDocument();
    expect(await findByRole('button', { name: 'Add Mock' })).toBeInTheDocument();
  });

  test('clicking "Add Mock" opens the create mock form', async () => {
    const user = userEvent.setup();
    setupChromeStorageMock();
    const { findByRole, findByTestId, findByText } = renderWithProviders(<Mocks />);

    await user.click(await findByRole('button', { name: 'Add Mock' }));

    expect(await findByText('Add new mock')).toBeInTheDocument();
    expect(await findByTestId('mock-form/url-input/value')).toBeInTheDocument();
  });
});
