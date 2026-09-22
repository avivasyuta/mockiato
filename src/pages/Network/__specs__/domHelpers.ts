import { screen, within } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

export const getNetworkCard = (url: string): HTMLElement => {
  const urlNode = screen.getByText(url);
  const card = urlNode.closest('[data-testid="network-row"]');
  if (!card) {
    throw new Error(`Could not find network card for url "${url}"`);
  }
  return card as HTMLElement;
};

export const toggleNetworkExpand = async (user: UserEvent, url: string): Promise<void> => {
  const card = getNetworkCard(url);
  await user.click(within(card).getByTestId('network-row/toggle-expand'));
};

export const createMockFromNetworkEvent = async (user: UserEvent, url: string): Promise<void> => {
  const card = getNetworkCard(url);
  await user.click(within(card).getByTestId('network-row/create-mock'));
};
