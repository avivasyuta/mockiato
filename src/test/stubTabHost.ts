/**
 * `useTabHost` (see src/hooks/useTab.ts) resolves the active tab's host via
 * `chrome.tabs.query`. Pages that filter by host (Logs, Network) render `null` until it
 * resolves, so tests for them need this stubbed after `setupChromeStorageMock` (which
 * replaces `globalThis.chrome` wholesale).
 */
export const stubTabHost = (host: string): void => {
  (globalThis as unknown as { chrome: { tabs: unknown } }).chrome.tabs = {
    query: (_query: unknown, callback: (tabs: { url: string }[]) => void) => {
      callback([{ url: `https://${host}/` }]);
    },
  };
};
