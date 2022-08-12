import React, { Dispatch } from 'react';
import { TMockFormAction, TStore } from '../../types';

type ContextProps = {
    dispatchMockForm: Dispatch<TMockFormAction>
    store: TStore,
    setStore: (newStore: TStore) => void
}

const initialProps = {
    dispatchMockForm: () => undefined,
    store: {
        mocks: [],
        logs: [],
    },
    setStore: () => undefined,
};

export const AppContext = React.createContext<ContextProps>(initialProps);
