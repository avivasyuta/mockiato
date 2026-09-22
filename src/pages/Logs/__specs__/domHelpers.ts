import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export const getLogCard = (url: string): HTMLElement => {
  const urlNode = screen.getByText(url);
  const card = urlNode.closest('[data-testid="log-row"]');
  if (!card) {
    throw new Error(`Could not find log card for url "${url}"`);
  }
  return card as HTMLElement;
};

export const toggleLogExpand = async (user: UserEvent, url: string): Promise<void> => {
  const card = getLogCard(url);
  await user.click(within(card).getByTestId('log-row/toggle-expand'));
};
