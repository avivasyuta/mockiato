import { useEffect, useState } from 'react';
import { useStore } from './useStore';
import { TMock, TMockGroup } from '../types';

type GroupId = string

type MocksByGroupsRecord = Record<GroupId, {
    group: TMockGroup
    mocks: TMock[]
}>

type UseMocks = {
    mocksByGroups: MocksByGroupsRecord,
    emptyMocks: TMock[],
    emptyGroups: TMockGroup[],
    mocks: TMock[],
    groups: TMockGroup[],
    setMocks: (val: TMock[]) => void,
    setGroups: (val: TMockGroup[]) => void,
}

export const useMocks = (): UseMocks => {
    const [mocks, setMocks] = useStore('mocks');
    const [groups, setGroups] = useStore('mockGroups');
    const [lonelyMocks, setLonelyMocks] = useState<TMock[]>([]);
    const [mocksByGroups, setMocksByGroups] = useState<MocksByGroupsRecord>({});
    const [lonelyGroups, setLonelyGroups] = useState<TMockGroup[]>([]);

    useEffect(() => {
        const usedGroupsIds = new Set<GroupId>();
        const newMocksByGroup: MocksByGroupsRecord = {};
        const newLonelyMocks: TMock[] = [];

        const groupsById: Record<GroupId, TMockGroup> = (groups ?? []).reduce((acc, group) => {
            return {
                ...acc,
                [group.id]: group,
            };
        }, {});

        mocks?.forEach((mock) => {
            if (!mock.groupId) {
                newLonelyMocks.push(mock);
            } else {
                if (!newMocksByGroup[mock.groupId]) {
                    newMocksByGroup[mock.groupId] = {
                        group: groupsById[mock.groupId],
                        mocks: [],
                    };
                }

                newMocksByGroup[mock.groupId].mocks.push(mock);
                usedGroupsIds.add(mock.groupId);
            }
        });

        // Filter groups without mocks
        const newLonelyGroups = (groups ?? []).filter((group) => !usedGroupsIds.has(group.id));

        setLonelyGroups(newLonelyGroups);
        setLonelyMocks(newLonelyMocks);
        setMocksByGroups(newMocksByGroup);
    }, [mocks, groups]);

    return {
        mocksByGroups,
        emptyMocks: lonelyMocks,
        emptyGroups: lonelyGroups,
        mocks: mocks ?? [],
        groups: groups ?? [],
        setMocks,
        setGroups,
    };
};
