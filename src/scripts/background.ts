/* eslint-disable no-restricted-syntax */

chrome.runtime?.onInstalled.addListener(async () => {
    const scripts = chrome.runtime.getManifest().content_scripts || [];
    for (const cs of scripts) {
        // eslint-disable-next-line no-await-in-loop
        for (const tab of await chrome.tabs.query({ url: cs.matches })) {
            if (tab.url?.startsWith('http')) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: cs.js,
                }).then();
            }
        }
    }
});

export {};
