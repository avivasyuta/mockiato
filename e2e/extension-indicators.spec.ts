import { expect, Page, test } from '@playwright/test';

type MessageListener = (message: unknown, sender: unknown, sendResponse: (response?: unknown) => void) => unknown;

interface ChromeStub {
  runtime: {
    getURL: (path: string) => string;
    sendMessage: (message: unknown) => Promise<unknown>;
    onMessage: { addListener: (listener: MessageListener) => void };
  };
  storage: {
    local: {
      get: (key: string) => Promise<Record<string, unknown>>;
      set: (values: Record<string, unknown>) => Promise<void>;
    };
    onChanged: {
      addListener: (listener: (changes: Record<string, { oldValue: unknown; newValue: unknown }>) => void) => void;
    };
  };
}

declare global {
  interface Window {
    chrome: ChromeStub;
  }
}

interface FullExtensionOptions {
  isEnabled: boolean;
  showActiveStatus: boolean;
  showNotifications: boolean;
}

const MOCKED_URL = 'https://jsonplaceholder.typicode.com/posts/1';

/**
 * Boots the real content script (dist/contentScript.js) against a page,
 * backed by an in-memory stub of chrome.storage.local instead of the real
 * extension APIs (unavailable for a plain page in the test browser). This
 * exercises the actual badge / toast / interceptor logic instead of
 * re-implementing it in the test.
 */
const gotoWithExtension = async (page: Page, options: FullExtensionOptions) => {
  await page.addInitScript((opts: FullExtensionOptions) => {
    const settings = {
      showNotifications: opts.showNotifications,
      showActiveStatus: opts.showActiveStatus,
      enabledHosts: { [window.location.host]: opts.isEnabled },
      showMobileNavBar: false,
      commentDisplayMode: 'tooltip',
      displayHttpMethodInline: false,
    };

    const mocks = [
      {
        id: 'e2e-mock',
        url: 'https://jsonplaceholder.typicode.com/posts/1',
        urlType: 'url',
        httpMethod: 'GET',
        httpStatusCode: 200,
        delay: 0,
        response: '{}',
        responseType: 'json',
        responseHeaders: [],
        isActive: true,
      },
    ];

    const state: Record<string, unknown> = {
      mockiato_store: {
        mocks,
        mockGroups: [],
        logs: [],
        headersProfiles: {},
        network: [],
        settings,
      },
    };

    const listeners: Array<(changes: Record<string, { oldValue: unknown; newValue: unknown }>) => void> = [];
    const messageListeners: MessageListener[] = [];

    window.chrome = {
      runtime: {
        getURL: (path: string) => `/dist/${path}`,
        // Faithfully emulates chrome.runtime's promise/callback bridging: the promise
        // resolves once some listener calls sendResponse, and only waits for an async
        // response if that listener returned `true` (the real MV3 contract background.js
        // relies on).
        sendMessage: (message: unknown) =>
          new Promise((resolve) => {
            let responded = false;
            const sendResponse = (response?: unknown) => {
              if (!responded) {
                responded = true;
                resolve(response);
              }
            };

            const willRespondAsync = messageListeners
              .map((listener) => listener(message, {}, sendResponse) === true)
              .some(Boolean);

            if (!willRespondAsync && !responded) {
              resolve(undefined);
            }
          }),
        onMessage: {
          addListener: (listener: MessageListener) => messageListeners.push(listener),
        },
      },
      storage: {
        local: {
          get: (key: string) => Promise.resolve({ [key]: state[key] }),
          set: (values: Record<string, unknown>) => {
            const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};

            Object.entries(values).forEach(([key, newValue]) => {
              changes[key] = { oldValue: state[key], newValue };
              state[key] = newValue;
            });

            return Promise.resolve().then(() => listeners.forEach((listener) => listener(changes)));
          },
        },
        onChanged: {
          addListener: (listener) => listeners.push(listener),
        },
      },
    };
  }, options);

  await page.goto('/e2e/full-extension-test-page.html');
  await page.waitForLoadState('networkidle');
  // The content script sets up storage/badge/alert-stack asynchronously on load.
  await page.waitForTimeout(300);
};

test.describe('Extension indicators (active-status badge and notifications)', () => {
  test('shows the active-status badge when the extension and the setting are both enabled', async ({ page }) => {
    await gotoWithExtension(page, {
      isEnabled: true,
      showActiveStatus: true,
      showNotifications: false,
    });

    await expect(page.locator('#mockiato-status')).toBeVisible();
  });

  test('hides the active-status badge when the showActiveStatus setting is disabled', async ({ page }) => {
    await gotoWithExtension(page, {
      isEnabled: true,
      showActiveStatus: false,
      showNotifications: false,
    });

    await expect(page.locator('#mockiato-status')).toHaveCount(0);
  });

  test('shows a notification toast for an intercepted request when showNotifications is enabled', async ({ page }) => {
    await gotoWithExtension(page, {
      isEnabled: true,
      showActiveStatus: false,
      showNotifications: true,
    });

    await page.click('#test-fetch');

    await expect(page.locator('.mockiato-alert-url', { hasText: MOCKED_URL })).toBeVisible();
  });

  test('does not show a notification toast when showNotifications is disabled', async ({ page }) => {
    await gotoWithExtension(page, {
      isEnabled: true,
      showActiveStatus: false,
      showNotifications: false,
    });

    await page.click('#test-fetch');
    await page.waitForTimeout(1000);

    await expect(page.locator('.mockiato-alert')).toHaveCount(0);
  });

  test('shows neither the badge nor a notification toast when the extension is disabled', async ({ page }) => {
    await gotoWithExtension(page, {
      isEnabled: false,
      showActiveStatus: true,
      showNotifications: true,
    });

    await page.click('#test-fetch');
    await page.waitForTimeout(1000);

    await expect(page.locator('#mockiato-status')).toBeHidden();
    await expect(page.locator('.mockiato-alert')).toHaveCount(0);
  });
});
