import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { initDB, db } from './database';
import { TRequest } from './types';

initDB();

// eslint-disable-next-line no-undef
if (chrome.runtime) {
    // get message with intercepted request from content script
    // eslint-disable-next-line no-undef
    chrome.runtime.onMessage.addListener((request: TRequest, sender, sendResponse) => {
        // find mocks for intercepted request
        db.mocks
            .where('url').equalsIgnoreCase(request.url)
            .filter((mock) => mock.isActive)
            .toArray()
            .then((mocks) => {
                sendResponse({
                    messageId: request.messageId,
                    mocks,
                });
            });

        return true;
    });
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement,
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
