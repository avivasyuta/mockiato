import { within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';

const renderCreateFormPage = async (user: ReturnType<typeof userEvent.setup>) => {
  const page = renderWithProviders(<Mocks />);
  await user.click(await page.findByRole('button', { name: 'Add Mock' }));
  return page;
};

describe('Mocks page [Create mock]', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setupChromeStorageMock();
  });

  test('creates a mock when only the minimal required fields are filled', async () => {
    const { findByTestId, findByText } = await renderCreateFormPage(user);

    await user.type(await findByTestId('mock-form/url-input/value'), 'https://example.com/api');
    await user.click(await findByTestId('mock-form/save'));

    expect(await findByText('Mock data was saved')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(1);
    expect(store.mocks[0]).toMatchObject({
      url: 'https://example.com/api',
      httpMethod: 'GET',
      httpStatusCode: 200,
      isActive: true,
    });
  });

  test('does not create a mock when the required URL field is left empty', async () => {
    const { findByTestId, queryByText } = await renderCreateFormPage(user);

    const urlInput = await findByTestId('mock-form/url-input/value');
    await user.click(await findByTestId('mock-form/save'));

    expect(urlInput).toBeInvalid();
    expect(queryByText('Mock data was saved')).not.toBeInTheDocument();
    // the drawer stayed open because nothing was submitted
    expect(await findByTestId('mock-form/save')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(0);
  });

  test('does not create a mock and shows a field error for an invalid response header key', async () => {
    const { findByTestId, findByText, queryByText } = await renderCreateFormPage(user);

    await user.type(await findByTestId('mock-form/url-input/value'), 'https://example.com/api');

    await user.click(await findByTestId('mock-form/tab-headers'));
    await user.click(await findByTestId('mock-form/header-add'));

    await user.click(await findByTestId('mock-form/save'));

    expect(await findByText('Only latin letters, numbers and symbols "-" and "_" are available')).toBeInTheDocument();
    expect(queryByText('Mock data was saved')).not.toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(0);
  });

  test('fills in every field, saves the mock', async () => {
    const { findByRole, findByText, findByTestId } = await renderCreateFormPage(user);

    await user.type(await findByTestId('mock-form/url-input/value'), 'https://api.example.com/users');
    await user.type(await findByTestId('mock-form/name'), 'My Mock');

    await user.click(within(await findByTestId('mock-form/status')).getByRole('radio', { name: 'Disabled' }));

    await user.click(await findByTestId('mock-form/method'));
    await user.click(await findByRole('option', { name: 'POST' }));

    const statusInput = await findByTestId('mock-form/status-code');
    await user.clear(statusInput);
    await user.type(statusInput, '201');

    const delayInput = await findByTestId('mock-form/delay');
    await user.clear(delayInput);
    await user.type(delayInput, '250');

    await user.type(await findByTestId('mock-form/comment'), 'some comment');
    await user.click(await findByTestId('mock-form/tab-headers'));
    await user.click(await findByTestId('mock-form/header-add'));
    await user.type(await findByTestId('mock-form/header-key-0'), 'X-Test');
    await user.click(await findByTestId('mock-form/save'));

    expect(await findByText('Mock data was saved')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mocks).toHaveLength(1);
    expect(store.mocks[0]).toMatchObject({
      url: 'https://api.example.com/users',
      name: 'My Mock',
      httpMethod: 'POST',
      httpStatusCode: 201,
      delay: 250,
      comment: 'some comment',
      isActive: false,
      responseHeaders: [expect.objectContaining({ key: 'X-Test' })],
    });
  });
});
