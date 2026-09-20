import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { HttpMethodType } from '~/types';

import { Mocks } from '../Mocks';
import { getGroupContainer } from './domHelpers';
import { buildGroup, buildMock } from './fixtures';

const selectFilterOption = async (
  user: ReturnType<typeof userEvent.setup>,
  filterTestId: string,
  optionName: string,
  findByTestId: (id: string) => Promise<HTMLElement>,
  findByRole: (role: string, opts: { name: string }) => Promise<HTMLElement>,
) => {
  await user.click(await findByTestId(filterTestId));
  await user.click(await findByRole('option', { name: optionName }));
};

describe('Mocks page [Filtering]', () => {
  test('filters mocks by name or URL', async () => {
    const user = userEvent.setup();
    const byName = buildMock({ name: 'Users list', url: 'https://api.example.com/users' });
    const byUrl = buildMock({ name: 'Something else', url: 'https://api.example.com/secret-path' });
    const noMatch = buildMock({ name: 'Orders list', url: 'https://api.example.com/orders' });
    setupChromeStorageMock({ mocks: [byName, byUrl, noMatch] });
    const { findByTestId, findByText, queryByText } = renderWithProviders(<Mocks />);

    // wait for the async store load to resolve and the unfiltered list to render first
    await findByText(byName.url);

    await user.type(await findByTestId('mock-filters/search'), 'users');
    expect(await findByText(byName.url)).toBeInTheDocument();
    expect(queryByText(byUrl.url)).not.toBeInTheDocument();
    expect(queryByText(noMatch.url)).not.toBeInTheDocument();

    await user.clear(await findByTestId('mock-filters/search'));
    await user.type(await findByTestId('mock-filters/search'), 'secret-path');
    expect(await findByText(byUrl.url)).toBeInTheDocument();
    expect(queryByText(byName.url)).not.toBeInTheDocument();
    expect(queryByText(noMatch.url)).not.toBeInTheDocument();
  });

  test('filters mocks by HTTP method', async () => {
    const user = userEvent.setup();
    const getMock = buildMock({ url: 'https://example.com/get-endpoint', httpMethod: HttpMethodType.GET });
    const postMock = buildMock({ url: 'https://example.com/post-endpoint', httpMethod: HttpMethodType.POST });
    setupChromeStorageMock({ mocks: [getMock, postMock] });
    const { findByRole, findByTestId, findByText, queryByText } = renderWithProviders(<Mocks />);

    // wait for the async store load to resolve and the unfiltered list to render first
    await findByText(getMock.url);

    await selectFilterOption(user, 'mock-filters/method', 'POST', findByTestId, findByRole);

    expect(await findByText(postMock.url)).toBeInTheDocument();
    expect(queryByText(getMock.url)).not.toBeInTheDocument();
  });

  test('filters mocks by HTTP status code', async () => {
    const user = userEvent.setup();
    const okMock = buildMock({ url: 'https://example.com/ok', httpStatusCode: 200 });
    const notFoundMock = buildMock({ url: 'https://example.com/missing', httpStatusCode: 404 });
    setupChromeStorageMock({ mocks: [okMock, notFoundMock] });
    const { findByRole, findByTestId, findByText, queryByText } = renderWithProviders(<Mocks />);

    // wait for the async store load to resolve and the unfiltered list to render first
    await findByText(okMock.url);

    await selectFilterOption(user, 'mock-filters/status-code', '404', findByTestId, findByRole);

    expect(await findByText(notFoundMock.url)).toBeInTheDocument();
    expect(queryByText(okMock.url)).not.toBeInTheDocument();
  });

  test('shows no results message when nothing matches, and clearing the filter restores the list', async () => {
    const user = userEvent.setup();
    const mock = buildMock({ url: 'https://example.com/a', name: 'Alpha' });
    setupChromeStorageMock({ mocks: [mock] });
    const { findByTestId, findByText } = renderWithProviders(<Mocks />);

    // wait for the async store load to resolve and the unfiltered list to render first
    await findByText(mock.url);

    const search = await findByTestId('mock-filters/search');
    await user.type(search, 'nothing matches this');

    expect(await findByText('No mocks match the current filters')).toBeInTheDocument();

    await user.clear(search);

    expect(await findByText(mock.url)).toBeInTheDocument();
  });

  test('filters apply to both ungrouped mocks and mocks inside groups', async () => {
    const user = userEvent.setup();

    const group = buildGroup({ name: 'Auth mocks' });
    const groupedMatch = buildMock({ name: 'Login', url: 'https://example.com/login', groupId: group.id });
    const groupedNoMatch = buildMock({ name: 'Logout', url: 'https://example.com/logout', groupId: group.id });

    const emptyAfterFilter = buildGroup({ name: 'Unrelated group' });
    const emptyAfterFilterMock = buildMock({
      name: 'Unrelated',
      url: 'https://example.com/unrelated',
      groupId: emptyAfterFilter.id,
    });

    const ungroupedMatch = buildMock({ name: 'Login extra', url: 'https://example.com/login-extra' });
    const ungroupedNoMatch = buildMock({ name: 'Misc', url: 'https://example.com/misc' });

    setupChromeStorageMock({
      mockGroups: [group, emptyAfterFilter],
      mocks: [groupedMatch, groupedNoMatch, emptyAfterFilterMock, ungroupedMatch, ungroupedNoMatch],
    });
    const { findByTestId, findByText, queryByText } = renderWithProviders(<Mocks />);

    // wait for the async store load to resolve and the unfiltered list to render first
    await findByText(groupedMatch.url);

    await user.type(await findByTestId('mock-filters/search'), 'login');

    // matching group stays, but only shows the mock that matched
    const groupContainer = getGroupContainer(group.name);
    expect(groupContainer).toHaveTextContent(groupedMatch.url);
    expect(groupContainer).not.toHaveTextContent(groupedNoMatch.url);

    // a group with no matching mocks is hidden entirely
    expect(queryByText(emptyAfterFilter.name)).not.toBeInTheDocument();
    expect(queryByText(emptyAfterFilterMock.url)).not.toBeInTheDocument();

    // ungrouped mocks are filtered the same way
    expect(await findByText(ungroupedMatch.url)).toBeInTheDocument();
    expect(queryByText(ungroupedNoMatch.url)).not.toBeInTheDocument();
  });
});
