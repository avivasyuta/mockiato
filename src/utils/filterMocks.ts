import { TMock, TMockGroup } from '../types';

type GroupWithMocks = {
    group: TMockGroup;
    mocks: TMock[];
};

type FilteredMocks = {
    groupsWithMocks: GroupWithMocks[];
    ungroupedMocks: TMock[];
};

export const filterMocks = (mocks: TMock[], groups: TMockGroup[]): FilteredMocks => {
    const mocksByGroupId = new Map<string, TMock[]>();

    const ungroupedMocks: TMock[] = [];

    mocks?.forEach((mock) => {
        if (!mock.groupId) {
            ungroupedMocks.push(mock);
        } else {
            if (!mocksByGroupId.has(mock.groupId)) {
                mocksByGroupId.set(mock.groupId, []);
            }
            mocksByGroupId.get(mock.groupId)!.push(mock);
        }
    });

    // All groups in their original order, with their mocks (or empty array)
    const groupsWithMocks: GroupWithMocks[] = groups.map((group) => ({
        group,
        mocks: mocksByGroupId.get(group.id) ?? [],
    }));

    return {
        groupsWithMocks,
        ungroupedMocks,
    };
};
