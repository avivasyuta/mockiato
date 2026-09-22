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

interface MockiatoTestState {
  mockiato_store: { logs: Array<{ url: string }> };
}

declare global {
  interface Window {
    chrome: ChromeStub;
    __mockiatoState: MockiatoTestState;
  }
}

// Distinct, non-numeric suffixes so none of the mock URLs is a string-prefix of another
// (getValidMocks matches by `startsWith`, so e.g. "/posts/1" would also match "/posts/10").
const MOCK_SUFFIXES = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel', 'india', 'juliet'];
const MOCKED_URLS = MOCK_SUFFIXES.map((suffix) => `https://jsonplaceholder.typicode.com/posts/e2e-${suffix}`);

/**
 * Boots the real content script AND the real background service worker
 * (dist/contentScript.js + dist/background.js, both loaded by full-extension-test-page.html)
 * against an in-memory stub of chrome.storage.local/chrome.runtime, with artificial latency
 * on storage.local.get/set so overlapping read-modify-write cycles reliably interleave if
 * they aren't serialized — the same trick the vitest specs use to expose this race.
 */
const gotoWithConcurrentMocks = async (page: Page) => {
  await page.addInitScript((urls: string[]) => {
    const settings = {
      showNotifications: false,
      showActiveStatus: false,
      enabledHosts: { [window.location.host]: true },
      showMobileNavBar: false,
      commentDisplayMode: 'tooltip',
      displayHttpMethodInline: false,
    };

    const mocks = urls.map((url, index) => ({
      id: `e2e-concurrency-mock-${index}`,
      url,
      urlType: 'url',
      httpMethod: 'GET',
      httpStatusCode: 200,
      delay: 0,
      response: '{}',
      responseType: 'json',
      responseHeaders: [],
      isActive: true,
    }));

    const state: MockiatoTestState = {
      mockiato_store: {
        mocks,
        mockGroups: [],
        logs: [],
        headersProfiles: {},
        network: [],
        settings,
      } as unknown as MockiatoTestState['mockiato_store'],
    };
    window.__mockiatoState = state;

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const storageListeners: Array<(changes: Record<string, { oldValue: unknown; newValue: unknown }>) => void> = [];
    const messageListeners: MessageListener[] = [];

    window.chrome = {
      runtime: {
        getURL: (path: string) => `/dist/${path}`,
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
          get: async (key: string) => {
            await delay(15);
            return { [key]: (state as unknown as Record<string, unknown>)[key] };
          },
          set: async (values: Record<string, unknown>) => {
            await delay(15);
            const changes: Record<string, { oldValue: unknown; newValue: unknown }> = {};

            Object.entries(values).forEach(([key, newValue]) => {
              changes[key] = { oldValue: (state as unknown as Record<string, unknown>)[key], newValue };
              (state as unknown as Record<string, unknown>)[key] = newValue;
            });

            storageListeners.forEach((listener) => listener(changes));
          },
        },
        onChanged: {
          addListener: (listener) => storageListeners.push(listener),
        },
      },
    };
  }, MOCKED_URLS);

  await page.goto('/e2e/full-extension-test-page.html');
  await page.waitForLoadState('networkidle');
  // The content script sets up storage/badge/alert-stack asynchronously on load.
  await page.waitForTimeout(300);
};

test.describe('Log concurrency', () => {
  test('N concurrent intercepted requests to distinct mocks produce N log entries, none lost', async ({ page }) => {
    await gotoWithConcurrentMocks(page);

    await page.evaluate(
      (urls) => Promise.all(urls.map((url) => fetch(url))),
      MOCKED_URLS,
    );

    await page.waitForFunction(
      (expectedCount) => window.__mockiatoState.mockiato_store.logs.length >= expectedCount,
      MOCKED_URLS.length,
      { timeout: 10_000 },
    );

    const logs = await page.evaluate(() => window.__mockiatoState.mockiato_store.logs);

    expect(logs).toHaveLength(MOCKED_URLS.length);
    expect(new Set(logs.map((log) => log.url))).toEqual(new Set(MOCKED_URLS));
  });
});
