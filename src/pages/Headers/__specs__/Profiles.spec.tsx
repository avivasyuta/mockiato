import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Headers } from '../Headers';
import { openProfileMenu } from './domHelpers';
import { buildHeader, buildProfile, profilesMap } from './fixtures';

describe('Headers page [Profiles]', () => {
  test('shows the empty state when there are no profiles', async () => {
    setupChromeStorageMock();
    const { findByText, findByTitle } = renderWithProviders(<Headers />);

    expect(await findByText('No profiles to show')).toBeInTheDocument();
    expect(await findByTitle('Add Profile')).toBeInTheDocument();
  });

  test('creates a new profile', async () => {
    const user = userEvent.setup();
    setupChromeStorageMock();
    const { findByTestId, findByText, findByTitle } = renderWithProviders(<Headers />);

    await user.click(await findByTitle('Add Profile'));

    await user.type(await findByTestId('add-profile-form/name'), 'Development');
    await user.click(await findByTestId('add-profile-form/submit'));

    expect(await findByText('Development')).toBeInTheDocument();
    expect(await findByText('No headers to show')).toBeInTheDocument();

    const store = await getStore();
    const profiles = Object.values(store.headersProfiles);
    expect(profiles).toHaveLength(1);
    expect(profiles[0]).toMatchObject({ name: 'Development', lastActive: true });
  });

  test('deletes a profile', async () => {
    const user = userEvent.setup();
    const profile = buildProfile('Development', { lastActive: true });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByRole, findByText } = renderWithProviders(<Headers />);

    await findByText('Development');

    await openProfileMenu(user);
    await user.click(await findByRole('menuitem', { name: 'Delete profile' }));

    expect(await findByText(`Delete headers profile «${profile.name}»`)).toBeInTheDocument();
    await user.click(await findByRole('button', { name: 'Delete' }));

    expect(await findByText('Profile deleted')).toBeInTheDocument();
    expect(await findByText('No profiles to show')).toBeInTheDocument();

    const store = await getStore();
    expect(Object.keys(store.headersProfiles)).toHaveLength(0);
  });

  test('switches the active profile', async () => {
    const user = userEvent.setup();
    const devHeader = buildHeader('X-Dev');
    const stagingHeader = buildHeader('X-Staging');
    const dev = buildProfile('Development', { lastActive: true, headers: [devHeader] });
    const staging = buildProfile('Staging', { lastActive: false, headers: [stagingHeader] });
    setupChromeStorageMock({ headersProfiles: profilesMap(dev, staging) });
    const { findByRole, findByTestId, findByText, queryByText } = renderWithProviders(<Headers />);

    await findByText('X-Dev:');
    expect(queryByText('X-Staging:')).not.toBeInTheDocument();

    await user.click(await findByTestId('profiles-actions/switcher'));
    await user.click(await findByRole('menuitem', { name: /Staging/ }));

    expect(await findByText('X-Staging:')).toBeInTheDocument();
    expect(queryByText('X-Dev:')).not.toBeInTheDocument();

    const store = await getStore();
    expect(store.headersProfiles[dev.id].lastActive).toBe(false);
    expect(store.headersProfiles[staging.id].lastActive).toBe(true);
  });

  test('enables and disables a profile', async () => {
    const user = userEvent.setup();
    const profile = buildProfile('Development', { lastActive: true, status: 'enabled' });
    setupChromeStorageMock({ headersProfiles: profilesMap(profile) });
    const { findByRole, findByText } = renderWithProviders(<Headers />);

    await findByText('Development');

    await openProfileMenu(user);
    await user.click(await findByRole('menuitem', { name: 'Disable profile' }));

    expect(await findByText('Profile disabled')).toBeInTheDocument();
    expect(await findByText('disabled')).toBeInTheDocument();

    let store = await getStore();
    expect(store.headersProfiles[profile.id].status).toBe('disabled');

    await openProfileMenu(user);
    await user.click(await findByRole('menuitem', { name: 'Enable profile' }));

    expect(await findByText('Profile enabled')).toBeInTheDocument();
    expect(await findByText('enabled')).toBeInTheDocument();

    store = await getStore();
    expect(store.headersProfiles[profile.id].status).toBe('enabled');
  });
});
