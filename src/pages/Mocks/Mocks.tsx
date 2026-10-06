import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';
import { Drawer, useMatches } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';

import { NotFound } from '~/components/NotFound';
import { Spinner } from '~/components/Spinner';
import { overlaySettings } from '~/constant';
import { useStore } from '~/hooks/useStore';
import { trimHeaders } from '~/pages/Mocks/components/MockForm/utils';
import { TMock, TMockGroup, TMocksViewState } from '~/types';
import { mergeGroups } from '~/utils/mergeGroups';
import { mergeMocks } from '~/utils/mergeMocks';

import { Content } from './components/Content';
import { MockForm } from './components/MockForm';
import { TopPanel } from './components/TopPanel';
import { TMockFilters, TMockFormAction, TMockFormState } from './types';

const initialMockFormState: TMockFormState = {
  isOpened: false,
  mock: undefined,
};

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr];
  const [item] = result.splice(from, 1);
  result.splice(to, 0, item);
  return result;
}

const mockFormReducer = (state: TMockFormState, action: TMockFormAction): TMockFormState => {
  switch (action.type) {
    case 'open':
      return { isOpened: true, mock: action.payload };
    case 'close':
      return { isOpened: false, mock: undefined };
    default:
      return state;
  }
};

const emptyMockFilters: TMockFilters = {
  search: '',
  httpMethod: null,
  httpStatusCode: null,
};

const MocksPage: React.FC = () => {
  const [mockForm, dispatchMockForm] = useReducer(mockFormReducer, initialMockFormState);
  const [mocks, setMocks] = useStore('mocks');
  const [groups, setGroups] = useStore('mockGroups');
  const [mocksView, setMocksView] = useStore('mocksView');
  const [filters, setFilters] = useState<TMockFilters>(emptyMockFilters);
  const drawerSize = useMatches({ base: '100%', md: '50%' });

  // Collapsed (not expanded) groups are persisted, so newly created or imported groups are expanded by default.
  const expandedGroups = useMemo(() => {
    const collapsedGroups = new Set(mocksView?.collapsedGroups ?? []);
    return new Set((groups ?? []).map((group) => group.id).filter((id) => !collapsedGroups.has(id)));
  }, [groups, mocksView]);

  const expandedMocks = useMemo(() => new Set(mocksView?.expandedMocks ?? []), [mocksView]);

  // Calculate areAllExpanded based on actual group and mock states
  const areAllExpanded = useMemo(() => {
    const groupList = groups ?? [];
    const mockList = mocks ?? [];
    if (groupList.length === 0 && mockList.length === 0) return false;

    const allGroupsExpanded = groupList.every((group) => expandedGroups.has(group.id));
    const allMocksExpanded = mockList.every((mock) => expandedMocks.has(mock.id));
    return allGroupsExpanded && allMocksExpanded;
  }, [groups, mocks, expandedGroups, expandedMocks]);

  const handleCopyMock = (mock: TMock) => {
    dispatchMockForm({
      type: 'open',
      payload: {
        ...mock,
        id: nanoid(),
      },
    });
  };

  const handleAddGroup = (group: TMockGroup) => {
    setGroups([...(groups ?? []), group]);
  };

  const handleOpenForm = () => {
    dispatchMockForm({ type: 'open' });
  };

  const handleCloseForm = () => {
    dispatchMockForm({ type: 'close' });
  };

  const handleEditMock = (mock: TMock) => {
    dispatchMockForm({
      type: 'open',
      payload: mock,
    });
  };

  const handleUpdateMocks = useCallback(
    (newMocks: TMock[]) => {
      setMocks(newMocks);
    },
    [setMocks],
  );

  const handleReorderGroups = useCallback(
    (activeId: string, overId: string) => {
      if (!groups) return;

      const oldIndex = groups.findIndex((g) => g.id === activeId);
      const newIndex = groups.findIndex((g) => g.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      setGroups(arrayMove(groups, oldIndex, newIndex));
    },
    [groups, setGroups],
  );

  // `undefined` means the key is missing in an older store, `null` - not loaded yet.
  if (!mocks || !groups || mocksView === null) {
    return <Spinner />;
  }

  const handleDeleteMock = (mockId: string) => {
    const newMocks = mocks.filter((m) => mockId !== m.id);

    setMocks(newMocks);
    showNotification({
      message: 'Mock was deleted',
      color: 'green',
    });
  };

  const handleChangeMock = (newMock: TMock): void => {
    const newMocks = mocks.map((mock) => (mock.id === newMock.id ? newMock : mock));
    setMocks(newMocks);
  };

  const handleDeleteGroup = async (groupId: TMockGroup['id']) => {
    const newGroups = groups.filter((group) => group.id !== groupId);
    const newMocks = mocks.filter((mock) => mock.groupId !== groupId);
    await setMocks(newMocks);
    await setGroups(newGroups);
  };

  const handleClearGroup = async (groupId: TMockGroup['id']) => {
    const newMocks = mocks.map((mock) => {
      const newMock = { ...mock };
      if (mock.groupId === groupId) {
        delete newMock.groupId;
      }
      return newMock;
    });

    await setMocks(newMocks);
  };

  const handleToggleMocksInGroup = async (groupId: string, status: boolean) => {
    const newMocks = mocks.map((mock) => {
      const newMock = { ...mock };
      if (mock.groupId === groupId) {
        newMock.isActive = status;
      }
      return newMock;
    });

    await setMocks(newMocks);
  };

  // Ids of deleted groups and mocks are dropped on every write so the persisted state doesn't grow forever.
  const updateMocksView = (collapsedGroups: Iterable<string>, expandedMockIds: Iterable<string>) => {
    const groupIds = new Set(groups.map((group) => group.id));
    const mockIds = new Set(mocks.map((mock) => mock.id));
    const view: TMocksViewState = {
      collapsedGroups: [...new Set(collapsedGroups)].filter((id) => groupIds.has(id)),
      expandedMocks: [...new Set(expandedMockIds)].filter((id) => mockIds.has(id)),
    };

    return setMocksView(view);
  };

  const collapsedGroups = mocksView?.collapsedGroups ?? [];

  const handleToggleAll = () => {
    if (areAllExpanded) {
      updateMocksView(
        groups.map((group) => group.id),
        [],
      );
    } else {
      updateMocksView(
        [],
        mocks.map((mock) => mock.id),
      );
    }
  };

  const handleToggleGroup = (groupId: string, isExpanded: boolean) => {
    const newCollapsedGroups = isExpanded
      ? collapsedGroups.filter((id) => id !== groupId)
      : [...collapsedGroups, groupId];

    updateMocksView(newCollapsedGroups, expandedMocks);
  };

  const handleToggleMock = (mockId: string, isExpanded: boolean) => {
    const newExpandedMocks = isExpanded ? [...expandedMocks, mockId] : [...expandedMocks].filter((id) => id !== mockId);

    updateMocksView(collapsedGroups, newExpandedMocks);
  };

  const submitForm = (values: TMock): void => {
    const mock = trimHeaders(values);
    const isNew = !mocks.find((m) => m.id === mock.id);

    if (isNew) {
      setMocks([mock, ...mocks]);
    } else {
      const newMocks = mocks.map((m) => {
        if (m.id === mock.id) {
          return mock;
        }
        return m;
      });

      setMocks(newMocks);
    }

    showNotification({
      message: 'Mock data was saved',
      color: 'green',
    });

    handleCloseForm();
  };

  const handleImportMocks = async (importedMocks: TMock[], importedGroups: TMockGroup[]) => {
    const newMocks = mergeMocks(mocks, importedMocks);
    const newGroups = mergeGroups(groups, importedGroups);

    // Groups must be persisted before mocks.
    await setGroups(newGroups);
    await setMocks(newMocks);

    const importedGroupIds = new Set(importedGroups.map((group) => group.id));
    await setMocksView({
      collapsedGroups: collapsedGroups.filter((id) => !importedGroupIds.has(id)),
      expandedMocks: [...expandedMocks],
    });

    showNotification({
      message: 'Mocks have been successfully imported',
      color: 'green',
    });
  };

  return (
    <>
      <TopPanel
        groups={groups}
        mocks={mocks}
        areAllExpanded={areAllExpanded}
        filters={filters}
        onFiltersChange={setFilters}
        onToggleAll={handleToggleAll}
        onMockAdd={handleOpenForm}
        onGroupAdd={handleAddGroup}
        onMocksImportSuccess={handleImportMocks}
      />

      {mocks.length > 0 || groups.length > 0 ? (
        <Content
          mocks={mocks}
          groups={groups}
          filters={filters}
          expandedGroups={expandedGroups}
          expandedMocks={expandedMocks}
          onToggleGroup={handleToggleGroup}
          onToggleMock={handleToggleMock}
          onDeleteMock={handleDeleteMock}
          onChangeMock={handleChangeMock}
          onEditMock={handleEditMock}
          onCopyMock={handleCopyMock}
          onDeleteGroup={handleDeleteGroup}
          onClearGroup={handleClearGroup}
          onToggleMocks={handleToggleMocksInGroup}
          onReorderGroups={handleReorderGroups}
          onUpdateMocks={handleUpdateMocks}
        />
      ) : (
        <NotFound text="No mocks to show" />
      )}

      <Drawer
        opened={mockForm.isOpened}
        padding="sm"
        position="right"
        size={drawerSize}
        withCloseButton={false}
        overlayProps={overlaySettings}
        styles={{
          content: { display: 'flex', flexDirection: 'column' },
          body: { display: 'flex', flex: 1 },
        }}
        offset={8}
        radius="md"
        onClose={handleCloseForm}
      >
        {mockForm.isOpened && (
          <MockForm
            mock={mockForm.mock}
            onClose={handleCloseForm}
            onSubmit={submitForm}
          />
        )}
      </Drawer>
    </>
  );
};

export const Mocks = memo(MocksPage);
