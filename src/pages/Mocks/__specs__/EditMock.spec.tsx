import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';
import { editMock, getGroupContainer } from './domHelpers';
import { buildGroup, buildMock } from './fixtures';

describe('Mocks page [Edit mock]', () => {
  test('opens the edit form pre-filled with the mock current values', async () => {
    const user = userEvent.setup();
    const mock = buildMock({
      name: 'Users list',
      url: 'https://api.example.com/users',
      httpStatusCode: 404,
      comment: 'legacy endpoint',
    });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByTestId, findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    await editMock(user, mock.url);

    expect(await findByTestId('mock-form/url-input/value')).toHaveValue(mock.url);
    expect(await findByTestId('mock-form/name')).toHaveValue('Users list');
    expect(await findByTestId('mock-form/method')).toHaveValue('GET');
    expect(await findByTestId('mock-form/status-code')).toHaveValue('404');
    expect(await findByTestId('mock-form/comment')).toHaveValue('legacy endpoint');
  });

  test('saves changes made in the edit form', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ name: 'Users list', url: 'https://api.example.com/users' });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByTestId, findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    await editMock(user, mock.url);

    const nameInput = await findByTestId('mock-form/name');
    await user.clear(nameInput);
    await user.type(nameInput, 'Users list v2');

    await user.click(await findByTestId('mock-form/save'));

    expect(await findByText('Mock data was saved')).toBeInTheDocument();
    expect(await findByText('Users list v2')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(1);
    expect(store.mocks[0]).toMatchObject({ id: mock.id, name: 'Users list v2', url: mock.url });
  });

  test('assigns a mock to a group via the edit form', async () => {
    const user = userEvent.setup();
    const group = buildGroup({ name: 'Auth mocks' });
    const mock = buildMock({ name: 'Users list', url: 'https://api.example.com/users' });
    setupChromeStorageMock({ mocks: [mock], mockGroups: [group] });
    const { findByRole, findByTestId, findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    await editMock(user, mock.url);

    await user.click(await findByTestId('mock-form/group'));
    await user.click(await findByRole('option', { name: group.name }));

    await user.click(await findByTestId('mock-form/save'));

    const store = await getStore();
    expect(store.mocks[0]).toMatchObject({ id: mock.id, groupId: group.id });

    await findByRole('button', { name: 'Add Mock' });
    const groupContainer = within(getGroupContainer(group.name));
    expect(groupContainer.getByText(mock.url)).toBeInTheDocument();
  });
});
