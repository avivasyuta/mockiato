import { getStore, setStoreValue } from '~/utils/storage';
import { TStore } from '~/types';
import { STORE_KEY } from '~/contstant';

let initialized = false;

const update = (enabledHosts: Record<string, boolean>, host: string) => {
    const isEnabled = enabledHosts[host] ?? false;

    const switchNode = document.getElementById('switch');
    const labelNode = document.getElementById('label');
    const statusNode = document.getElementById('status');
    const checkboxNode = <HTMLInputElement>document.getElementById('mocking-status');

    if (!labelNode || !statusNode || !checkboxNode || !switchNode) {
        return;
    }

    labelNode.innerText = isEnabled ? 'ENABLED' : 'DISABLED';
    statusNode.innerText = isEnabled ? 'enabled' : 'disabled';
    checkboxNode.checked = isEnabled;

    if (isEnabled) {
        switchNode.classList.add('checked');
    } else {
        switchNode.classList.remove('checked');
    }

    // The initial state is applied asynchronously (after reading the store), so
    // enable CSS transitions only once it's committed — otherwise an already-on
    // toggle animates from off to on every time the popup opens.
    if (!initialized) {
        initialized = true;
        // Force a style/layout flush so the current state becomes the baseline…
        switchNode.getBoundingClientRect();
        // then re-enable transitions on the next frames (double rAF is needed
        // so the "no-transition" paint lands before the class is added).
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                document.body.classList.add('ready');
            });
        });
    }
};

document.getElementById('open-tab')?.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
});

chrome?.tabs?.query(
    {
        active: true,
        currentWindow: true,
    },
    async (tabs) => {
        const tab = tabs[0];
        if (!tab?.url) {
            return;
        }

        const url = new URL(tab.url as string);
        const store = await getStore();

        update(store.settings.enabledHosts, url.host);

        const hostNode = document.getElementById('host');
        if (hostNode) {
            hostNode.innerText = url.host;
        }

        chrome.storage.onChanged.addListener((changes) => {
            Object.entries(changes).forEach(([key, change]) => {
                if (key === STORE_KEY) {
                    update((change.newValue as TStore).settings.enabledHosts, url.host);
                }
            });
        });

        const checkboxNode = document.getElementById('mocking-status');

        checkboxNode?.addEventListener('change', async (e) => {
            const s = await getStore();
            const newSettings = { ...s.settings };

            const target = e.target as HTMLInputElement;

            if (target.checked) {
                newSettings.enabledHosts[url.host] = true;
            } else {
                delete newSettings.enabledHosts[url.host];
            }

            await setStoreValue('settings', newSettings);
        });

        const links = document.getElementById('links');
        links?.addEventListener('click', (e) => {
            const target = e.target as HTMLLinkElement;

            if (target.href) {
                chrome.tabs.create({ url: target.href });
            }
        });
    },
);
