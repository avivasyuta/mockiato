import { act } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { setupChromeStorageMock } from '~/test/chromeStorageMock';
import { renderWithProviders } from '~/test/renderWithProviders';
import { getStore } from '~/utils/storage';

import { Mocks } from '../Mocks';
import { getGroupContainer } from './domHelpers';
import { buildGroup, buildMock } from './fixtures';

// jsdom can't run real HTML5 drag-and-drop (no layout/elementFromPoint support, which
// @atlaskit/pragmatic-drag-and-drop relies on for hit-testing), so instead of simulating
// drag events we mock the adapter and invoke the `onDrop` callback that
// components/Content/Content.tsx registers via `monitorForElements` directly. That callback
// *is* the business logic under test (moving a mock between groups); `draggable` and
// `dropTargetForElements` only drive visual drag feedback, so they're stubbed out.
type DropPayload = {
  source: { data: Record<string, unknown> };
  location: { current: { dropTargets: [{ data: Record<string, unknown> }]; ranBefore?: boolean } };
};

const onDropRef = vi.hoisted(() => ({ current: null as null | ((payload: DropPayload) => void) }));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: () => () => {},
  dropTargetForElements: () => () => {},
  monitorForElements: (args: { onDrop: (payload: DropPayload) => void }) => {
    onDropRef.current = args.onDrop;
    return () => {};
  },
}));

const drop = async (payload: DropPayload) => {
  await act(async () => {
    onDropRef.current?.(payload);
  });
};

describe('Mocks page [Drag and drop]', () => {
  beforeEach(() => {
    onDropRef.current = null;
  });

  test('moves an ungrouped mock into a group', async () => {
    const group = buildGroup({ name: 'Auth mocks' });
    const mock = buildMock({ url: 'https://example.com/ungrouped' });
    setupChromeStorageMock({ mockGroups: [group], mocks: [mock] });
    const { findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    expect(onDropRef.current).not.toBeNull();

    await drop({
      source: { data: { type: 'mock', mockId: mock.id, groupId: null } },
      location: { current: { dropTargets: [{ data: { type: 'group', groupId: group.id } }] } },
    });

    const store = await getStore();
    expect(store.mocks[0]).toMatchObject({ id: mock.id, groupId: group.id });
    expect(await findByText(mock.url)).toBeInTheDocument();
    expect(getGroupContainer(group.name)).toHaveTextContent(mock.url);
  });

  test('moves a grouped mock back out to the ungrouped list', async () => {
    const group = buildGroup({ name: 'Auth mocks' });
    const mock = buildMock({ url: 'https://example.com/grouped', groupId: group.id });
    setupChromeStorageMock({ mockGroups: [group], mocks: [mock] });
    const { findByText } = renderWithProviders(<Mocks />);

    await findByText(mock.url);
    expect(getGroupContainer(group.name)).toHaveTextContent(mock.url);

    await drop({
      source: { data: { type: 'mock', mockId: mock.id, groupId: group.id } },
      location: { current: { dropTargets: [{ data: { type: 'ungrouped' } }] } },
    });

    const store = await getStore();
    expect(store.mocks[0]).toMatchObject({ id: mock.id });
    expect(store.mocks[0].groupId).toBeUndefined();
    expect(getGroupContainer(group.name)).not.toHaveTextContent(mock.url);
  });
});
