import { TMockGroup } from '~/types';

export const mergeGroups = (groups: TMockGroup[], newGroups: TMockGroup[]) => {
    const groupsMap = new Map<string, TMockGroup>();

    groups.forEach((group) => groupsMap.set(group.id, group));
    newGroups.forEach((group) => {
        if (!groupsMap.has(group.id)) {
            groupsMap.set(group.id, group);
        }
    });

    return [...groupsMap.values()];
};
