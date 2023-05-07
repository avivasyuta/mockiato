import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initStore } from './utils/storage';
import { TStore } from './types';

const root = createRoot(
    document.getElementById('root') as HTMLElement,
);

const initialStore: TStore = {
    mocks: [],
    logs: [],
    headersProfiles: [],
};

(async () => {
    await initStore(initialStore);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
})();
