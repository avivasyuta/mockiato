import { TMockGroup } from '~/types';

export const isUnique = (name: string, groups: TMockGroup[]): boolean => {
    const group = groups.find((g) => g.name === name);
    return !group;
};
