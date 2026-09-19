import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/**
 * The mock row (see components/Content/components/Mock/Mock.tsx) has several action
 * buttons with no accessible name (drag handle, expand toggle, delete), so it and they
 * carry explicit `data-testid`s instead of relying on DOM order or title text.
 */
export const getMockCard = (url: string): HTMLElement => {
  const urlNode = screen.getByText(url);
  const card = urlNode.closest('[data-testid="mock-row"]');
  if (!card) {
    throw new Error(`Could not find mock card for url "${url}"`);
  }
  return card as HTMLElement;
};

export const toggleMockExpand = async (user: UserEvent, url: string): Promise<void> => {
  const card = getMockCard(url);
  await user.click(within(card).getByTestId('mock-row/toggle-expand'));
};

export const cloneMock = async (user: UserEvent, url: string): Promise<void> => {
  const card = getMockCard(url);
  await user.click(within(card).getByTestId('mock-row/clone'));
};

export const editMock = async (user: UserEvent, url: string): Promise<void> => {
  const card = getMockCard(url);
  await user.click(within(card).getByTestId('mock-row/edit'));
};

export const deleteMock = async (user: UserEvent, url: string): Promise<void> => {
  const card = getMockCard(url);
  await user.dblClick(within(card).getByTestId('mock-row/delete'));
};

export const getMockStatusSwitch = (url: string): HTMLElement => {
  const card = getMockCard(url);
  return within(card).getByTestId('mock-row/status-switch');
};

/**
 * The whole rendered group section (header + its mocks, see
 * components/Content/components/MockGroup/MockGroup.tsx), located by its name text since
 * group names are enforced unique by AddGroupForm - and scoped via `data-testid` rather
 * than Mantine's internal class names.
 */
export const getGroupContainer = (groupName: string): HTMLElement => {
  const nameNode = screen.getByText(groupName, { exact: false });
  const container = nameNode.closest('[data-testid="mock-group"]');
  if (!container) {
    throw new Error(`Could not find group container for "${groupName}"`);
  }
  return container as HTMLElement;
};

export const getGroupMenuButton = (groupName: string): HTMLElement => {
  return within(getGroupContainer(groupName)).getByTestId('mock-group/menu-trigger');
};

export const openGroupMenu = async (user: UserEvent, groupName: string): Promise<void> => {
  await user.click(getGroupMenuButton(groupName));
};
