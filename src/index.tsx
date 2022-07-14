import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { initDB, db } from './database'
import { MockStatus, TRequest } from './types';

initDB()

// get message with intercepted request from content script
chrome.runtime.onMessage.addListener(function (request: TRequest, sender, sendResponse) {
    // find mocks for intercepted request
    db.mocks
        .where('url').equalsIgnoreCase(request.url)
        .filter((mock) => mock.status === MockStatus.ACTIVE)
        .toArray()
        .then(mocks => {
            console.log('in ext',{
                messageId: request.messageId,
                mocks
            } )

            sendResponse({
                messageId: request.messageId,
                mocks
            })
        })

    return true
});

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>
);
