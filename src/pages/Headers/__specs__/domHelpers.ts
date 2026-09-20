import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

/**
 * The header row (see components/Profile/components/HeaderList/HeaderList.tsx) has action
 * buttons with no accessible name (edit, delete, the on/off switch), so it and they carry
 * explicit `data-testid`s. Rows are located by their key text (`{key}:`, rendered as a
 * single text node) since header keys are unique within a profile.
 */
export const getHeaderRow = (key: string): HTMLElement => {
  const keyNode = screen.getByText(`${key}:`);
  const row = keyNode.closest('[data-testid="header-row"]');
  if (!row) {
    throw new Error(`Could not find header row for key "${key}"`);
  }

  return row as HTMLElement;
};

export const toggleHeaderStatus = async (user: UserEvent, key: string): Promise<void> => {
  const row = getHeaderRow(key);
  await user.click(within(row).getByTestId('header-row/status-switch'));
};

export const editHeader = async (user: UserEvent, key: string): Promise<void> => {
  const row = getHeaderRow(key);
  await user.click(within(row).getByTestId('header-row/edit'));
};

export const deleteHeader = async (user: UserEvent, key: string): Promise<void> => {
  const row = getHeaderRow(key);
  await user.dblClick(within(row).getByTestId('header-row/delete'));
};

export const openProfileMenu = async (user: UserEvent): Promise<void> => {
  await user.click(await screen.findByTestId('profile-menu/trigger'));
};
