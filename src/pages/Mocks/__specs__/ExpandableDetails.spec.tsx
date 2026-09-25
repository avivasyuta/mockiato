import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { emptyStore } from '~/utils/storeCore';

import { Mocks } from '../Mocks';
import { getMockCard, toggleMockExpand } from './domHelpers';
import { buildMock } from './fixtures';

describe('Mocks page [Expandable mock details setting]', () => {
  test('shows the expand toggle that reveals mock details when the setting is enabled', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/expandable', delay: 350 });
    setupChromeStorageMock({
      mocks: [mock],
      settings: { ...emptyStore.settings, expandableMockDetails: true },
    });
    const { findByText } = renderWithProviders(<Mocks />);
    await findByText(mock.url);

    const card = getMockCard(mock.url);
    expect(within(card).getByTestId('mock-row/toggle-expand')).toBeInTheDocument();
    expect(within(card).queryByText('350 ms')).not.toBeInTheDocument();

    await toggleMockExpand(user, mock.url);

    // Collapse only mounts its content once expanded; jsdom never finishes the height transition,
    // so assert presence rather than visibility.
    expect(await within(card).findByText('Status code:')).toBeInTheDocument();
    expect(within(card).getByText('350 ms')).toBeInTheDocument();
  });

  test('hides the expand toggle and mock details when the setting is disabled', async () => {
    const mock = buildMock({ url: 'https://example.com/not-expandable', delay: 350 });
    setupChromeStorageMock({
      mocks: [mock],
      settings: { ...emptyStore.settings, expandableMockDetails: false },
    });
    const { findByText } = renderWithProviders(<Mocks />);
    await findByText(mock.url);

    const card = getMockCard(mock.url);
    expect(within(card).queryByTestId('mock-row/toggle-expand')).not.toBeInTheDocument();
    expect(within(card).queryByText('Status code:')).not.toBeInTheDocument();
  });
});
