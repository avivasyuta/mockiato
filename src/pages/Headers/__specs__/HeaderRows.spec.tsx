import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Headers } from '../Headers';
import { deleteHeader, editHeader, getHeaderRow, toggleHeaderStatus } from './domHelpers';
import { buildHeader, buildProfile, profilesMap } from './fixtures';

describe('Headers page [Header rows]', () => {
  test('shows the empty state when the profile has no headers', async () => {
    const profile = buildProfile('Default', { lastActive: true, headers: [] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByText } = renderWithProviders(<Headers />);

    expect(await findByText('No headers to show')).toBeInTheDocument();
  });

  test('adds a header without a URL', async () => {
    const user = userEvent.setup();
    const profile = buildProfile('Default', { lastActive: true, headers: [] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByTestId, findByText } = renderWithProviders(<Headers />);

    await findByText('No headers to show');
    await user.click(await findByTestId('headers-top-panel/add-header'));

    await user.type(await findByTestId('header-form/key'), 'X-Custom');
    await user.type(await findByTestId('header-form/value'), 'my-value');
    await user.click(await findByTestId('header-form/save'));

    expect(await findByText('Header modification data was saved')).toBeInTheDocument();

    const row = getHeaderRow('X-Custom');
    expect(row).toHaveTextContent('my-value');
    expect(row).toHaveTextContent("Works for all URL's");

    const store = await getStore();
    const [header] = Object.values(store.headersProfiles)[0].headers;
    expect(header).toMatchObject({ key: 'X-Custom', value: 'my-value', isActive: true });
    expect(header.url).toBeUndefined();
  });

  test('adds a header with a URL', async () => {
    const user = userEvent.setup();
    const profile = buildProfile('Default', { lastActive: true, headers: [] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByTestId, findByText } = renderWithProviders(<Headers />);

    await findByText('No headers to show');
    await user.click(await findByTestId('headers-top-panel/add-header'));

    await user.type(await findByTestId('header-form/key'), 'X-Custom');
    await user.type(await findByTestId('header-form/value'), 'my-value');
    await user.click(await findByTestId('header-form/specify-url'));
    await user.type(await findByTestId('header-form/url-input/value'), 'https://example.com/path');
    await user.click(await findByTestId('header-form/save'));

    expect(await findByText('Header modification data was saved')).toBeInTheDocument();

    const row = getHeaderRow('X-Custom');
    expect(row).toHaveTextContent('https://example.com/path');
    expect(row).toHaveTextContent('GET');

    const store = await getStore();
    const [header] = Object.values(store.headersProfiles)[0].headers;
    expect(header).toMatchObject({
      key: 'X-Custom',
      url: 'https://example.com/path',
      urlType: 'url',
      httpMethod: 'GET',
    });
  });

  test('adds a header with a regular expression URL', async () => {
    const user = userEvent.setup();
    const profile = buildProfile('Default', { lastActive: true, headers: [] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByTestId, findByText } = renderWithProviders(<Headers />);

    await findByText('No headers to show');
    await user.click(await findByTestId('headers-top-panel/add-header'));

    await user.type(await findByTestId('header-form/key'), 'X-Custom');
    await user.type(await findByTestId('header-form/value'), 'my-value');
    await user.click(await findByTestId('header-form/specify-url'));
    await user.click(await findByTestId('header-form/url-input/regexp-checkbox'));
    // `user.type` parses `{`/`[` as special-key syntax, so paste the literal regexp instead.
    await user.click(await findByTestId('header-form/url-input/value'));
    await user.paste('/path/[a-z]+');
    await user.click(await findByTestId('header-form/save'));

    expect(await findByText('Header modification data was saved')).toBeInTheDocument();

    const store = await getStore();
    const [header] = Object.values(store.headersProfiles)[0].headers;
    expect(header).toMatchObject({ url: '/path/[a-z]+', urlType: 'regexp' });
  });

  test('edits a header', async () => {
    const user = userEvent.setup();
    const header = buildHeader('X-Original', { value: 'original-value' });
    const profile = buildProfile('Default', { lastActive: true, headers: [header] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByTestId, findByText } = renderWithProviders(<Headers />);

    await findByText('original-value');
    await editHeader(user, 'X-Original');

    const valueInput = await findByTestId('header-form/value');
    expect(valueInput).toHaveValue('original-value');
    await user.clear(valueInput);
    await user.type(valueInput, 'updated-value');

    await user.click(await findByTestId('header-form/save'));

    expect(await findByText('Header modification data was saved')).toBeInTheDocument();
    expect(getHeaderRow('X-Original')).toHaveTextContent('updated-value');

    const store = await getStore();
    const [storedHeader] = Object.values(store.headersProfiles)[0].headers;
    expect(storedHeader).toMatchObject({ id: header.id, key: 'X-Original', value: 'updated-value' });
  });

  test('enables and disables a header', async () => {
    const user = userEvent.setup();
    const header = buildHeader('X-Toggle', { isActive: true });
    const profile = buildProfile('Default', { lastActive: true, headers: [header] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByText } = renderWithProviders(<Headers />);

    await findByText('X-Toggle:');

    await toggleHeaderStatus(user, 'X-Toggle');
    let store = await getStore();
    expect(Object.values(store.headersProfiles)[0].headers[0].isActive).toBe(false);

    await toggleHeaderStatus(user, 'X-Toggle');
    store = await getStore();
    expect(Object.values(store.headersProfiles)[0].headers[0].isActive).toBe(true);
  });

  test('deletes a header on double click', async () => {
    const user = userEvent.setup();
    const header = buildHeader('X-Delete-Me');
    const profile = buildProfile('Default', { lastActive: true, headers: [header] });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByText, queryByText } = renderWithProviders(<Headers />);

    await findByText('X-Delete-Me:');

    await deleteHeader(user, 'X-Delete-Me');

    expect(queryByText('X-Delete-Me:')).not.toBeInTheDocument();
    expect(await findByText('No headers to show')).toBeInTheDocument();

    const store = await getStore();
    expect(Object.values(store.headersProfiles)[0].headers).toHaveLength(0);
  });
});
