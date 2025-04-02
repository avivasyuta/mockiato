import { TMock } from '~/types';

export const mergeMocks = (mocks: TMock[], newMocks: TMock[]) => {
    const mocksMap = new Map<string, TMock>();

    mocks.forEach((mock) => mocksMap.set(mock.id, mock));
    newMocks.forEach((mock) => {
        if (!mocksMap.has(mock.id)) {
            mocksMap.set(mock.id, mock);
        }
    });

    return [...mocksMap.values()];
};
