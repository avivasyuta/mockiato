import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';
import { getGroupContainer, getMockStatusSwitch, openGroupMenu } from './domHelpers';
import { buildGroup, buildMock } from './fixtures';

describe('Mocks page [Groups]', () => {
  test('creates a new group from the top panel', async () => {
    const user = userEvent.setup();
    setupChromeStorageMock();
    const { findByRole, findByText } = renderWithProviders(<Mocks />);

    await user.click(await findByRole('button', { name: 'More actions' }));
    await user.click(await findByRole('menuitem', { name: 'Add new group' }));

    await user.type(await findByRole('textbox', { name: 'Group name' }), 'Auth mocks');
    await user.click(await findByRole('button', { name: 'Submit' }));

    expect(await findByText('Auth mocks')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mockGroups).toHaveLength(1);
    expect(store.mockGroups[0]).toMatchObject({ name: 'Auth mocks' });
  });

  test('shows an error and does not create a group with a duplicate name', async () => {
    const user = userEvent.setup();
    const existingGroup = buildGroup({ name: 'Auth mocks' });
    setupChromeStorageMock({ mockGroups: [existingGroup] });
    const { findByRole, findByText } = renderWithProviders(<Mocks />);

    await user.click(await findByRole('button', { name: 'More actions' }));
    await user.click(await findByRole('menuitem', { name: 'Add new group' }));

    await user.type(await findByRole('textbox', { name: 'Group name' }), 'Auth mocks');
    await user.click(await findByRole('button', { name: 'Submit' }));

    expect(await findByText('Group already exists')).toBeInTheDocument();

    const store = await getStore();
    expect(store.mockGroups).toHaveLength(1);
  });

  test('enables and disables every mock in a group from the group menu', async () => {
    const user = userEvent.setup();
    const group = buildGroup({ name: 'Auth mocks' });
    const mockA = buildMock({ url: 'https://example.com/a', groupId: group.id, isActive: false });
    const mockB = buildMock({ url: 'https://example.com/b', groupId: group.id, isActive: false });
    setupChromeStorageMock({ mockGroups: [group], mocks: [mockA, mockB] });
    const { findByText } = renderWithProviders(<Mocks />);

    await findByText(group.name);

    await openGroupMenu(user, group.name);
    await user.click(await findByText('Enable all'));

    let store = await getStore();
    expect(store.mocks.every((m) => m.isActive)).toBe(true);
    expect(getMockStatusSwitch(mockA.url)).toBeChecked();
    expect(getMockStatusSwitch(mockB.url)).toBeChecked();

    await openGroupMenu(user, group.name);
    await user.click(await findByText('Disable all'));

    store = await getStore();
    expect(store.mocks.every((m) => !m.isActive)).toBe(true);
  });

  test('keeps a collapsed group collapsed when another group is changed', async () => {
    const user = userEvent.setup();
    const collapsedGroup = buildGroup({ name: 'Collapsed group' });
    const otherGroup = buildGroup({ name: 'Other group' });
    const mockA = buildMock({ url: 'https://example.com/a', groupId: collapsedGroup.id });
    const mockB = buildMock({ url: 'https://example.com/b', groupId: otherGroup.id, isActive: false });
    setupChromeStorageMock({ mockGroups: [collapsedGroup, otherGroup], mocks: [mockA, mockB] });
    const { findByText } = renderWithProviders(<Mocks />);

    await user.click(await findByText(collapsedGroup.name));
    const isCollapsed = () =>
      getGroupContainer(collapsedGroup.name).querySelector('.tabler-icon-chevron-down') !== null;
    expect(isCollapsed()).toBe(true);

    await openGroupMenu(user, otherGroup.name);
    await user.click(await findByText('Enable all'));

    await waitFor(() => expect(getMockStatusSwitch(mockB.url)).toBeChecked());
    expect(isCollapsed()).toBe(true);
  });

  test('restores collapsed groups after the page is reopened', async () => {
    const user = userEvent.setup();
    const collapsedGroup = buildGroup({ name: 'Collapsed group' });
    const expandedGroup = buildGroup({ name: 'Expanded group' });
    const mockA = buildMock({ url: 'https://example.com/a', groupId: collapsedGroup.id });
    const mockB = buildMock({ url: 'https://example.com/b', groupId: expandedGroup.id });
    setupChromeStorageMock({ mockGroups: [collapsedGroup, expandedGroup], mocks: [mockA, mockB] });
    const isCollapsed = (groupName: string) =>
      getGroupContainer(groupName).querySelector('.tabler-icon-chevron-down') !== null;

    const firstRender = renderWithProviders(<Mocks />);
    await user.click(await firstRender.findByText(collapsedGroup.name));
    await waitFor(async () => {
      expect((await getStore()).mocksView.collapsedGroups).toEqual([collapsedGroup.id]);
    });
    firstRender.unmount();

    const secondRender = renderWithProviders(<Mocks />);
    await secondRender.findByText(collapsedGroup.name);

    expect(isCollapsed(collapsedGroup.name)).toBe(true);
    expect(isCollapsed(expandedGroup.name)).toBe(false);
  });

  test('removes mocks from a group without deleting them', async () => {
    const user = userEvent.setup();
    const group = buildGroup({ name: 'Auth mocks' });
    const mock = buildMock({ url: 'https://example.com/a', groupId: group.id });
    setupChromeStorageMock({ mockGroups: [group], mocks: [mock] });
    const { findByText, findByRole } = renderWithProviders(<Mocks />);

    await findByText(group.name);

    await openGroupMenu(user, group.name);
    await user.click(await findByText('Remove mocks from group'));

    const store = await getStore();
    expect(store.mocks).toHaveLength(1);
    expect(store.mocks[0].groupId).toBeUndefined();
    // the group itself still exists, now empty
    expect(store.mockGroups).toHaveLength(1);
    expect(await findByText(group.name)).toBeInTheDocument();
    expect(await findByText(mock.url)).toBeInTheDocument();
    expect(await findByRole('button', { name: 'Add Mock' })).toBeInTheDocument();
  });

  test('deletes a group and all of its mocks after confirming', async () => {
    const user = userEvent.setup();
    const group = buildGroup({ name: 'Auth mocks' });
    const mock = buildMock({ url: 'https://example.com/a', groupId: group.id });
    const ungroupedMock = buildMock({ url: 'https://example.com/b' });
    setupChromeStorageMock({ mockGroups: [group], mocks: [mock, ungroupedMock] });
    const { findByText, findByRole, queryByText } = renderWithProviders(<Mocks />);

    await findByText(group.name);

    await openGroupMenu(user, group.name);
    await user.click(await findByText('Delete group'));

    const confirmText = `Are you sure you want to delete group «${group.name}» and all mocks in it?`;
    expect(await findByText(confirmText)).toBeInTheDocument();
    await user.click(await findByRole('button', { name: 'Delete' }));

    expect(queryByText(group.name)).not.toBeInTheDocument();
    expect(queryByText(mock.url)).not.toBeInTheDocument();
    expect(await findByText(ungroupedMock.url)).toBeInTheDocument();

    const store = await getStore();
    expect(store.mockGroups).toHaveLength(0);
    expect(store.mocks).toEqual([ungroupedMock]);
  });
});
