import { TMockHeader, TMock } from '../../../types';

export const trimHeaders = (mock: TMock): TMock => ({
    ...mock,
    responseHeaders: mock.responseHeaders.reduce((acc: TMockHeader[], header: TMockHeader) => {
        if (header.key !== '') {
            return [...acc, header];
        }
        return acc;
    }, []),
});
