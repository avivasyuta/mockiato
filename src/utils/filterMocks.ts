import { TMock, TMockGroup } from '../types';

type GroupId = string

type MocksByGroupsRecord = Record<GroupId, {
    group: TMockGroup
    mocks: TMock[]
}>

type FilteredMocks = {
    mocksByGroups: MocksByGroupsRecord,
    emptyMocks: TMock[],
    emptyGroups: TMockGroup[],
}

export const filterMocks = (mocks: TMock[], groups: TMockGroup[]): FilteredMocks => {
    const usedGroupsIds = new Set<GroupId>();
    const mocksByGroups: MocksByGroupsRecord = {};
    const emptyMocks: TMock[] = [];

    const groupsById: Record<GroupId, TMockGroup> = groups.reduce((acc, group) => {
        return {
            ...acc,
            [group.id]: group,
        };
        }, {});
    
    mocks?.forEach((mock) => {
        if (!mock.groupId) {
            emptyMocks.push(mock);
        } else {
            if (!mocksByGroups[mock.groupId]) {
                mocksByGroups[mock.groupId] = {
                    group: groupsById[mock.groupId],
                    mocks: [],
                };
            }

            mocksByGroups[mock.groupId].mocks.push(mock);
            usedGroupsIds.add(mock.groupId);
        }
    });
    
    // Filter groups without mocks
    const emptyGroups = (groups ?? []).filter((group) => !usedGroupsIds.has(group.id));

    return {
        mocksByGroups,
        emptyMocks,
        emptyGroups,
    };
};
