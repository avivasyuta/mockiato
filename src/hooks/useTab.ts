import { useState } from 'react';

const defaultTab = process.env.NODE_ENV === 'development' ? window.location.host : null;

export const useTabHost = () => {
    const [host, setHost] = useState<string | null>(defaultTab);

    chrome?.tabs?.query({
        active: true,
        currentWindow: true,
    }, (tabs) => {
        const tab = tabs[0];
        if (!host && tab?.url) {
            const url = new URL(tab.url as string);
            setHost(url.hostname);
        }
    });

    return host;
};
