/**
 * true — the app is open as a standalone browser tab
 * (not the DevTools panel and not the `npm run dev` dev server).
 *
 * The DevTools panel has access to `chrome.devtools.inspectedWindow`; a regular
 * extension tab does not. Dev mode is intentionally treated as "not standalone"
 * so that the whole UI stays visible during local development.
 */
export const isStandaloneTab = (): boolean => {
  if (import.meta.env.VITE_NODE_ENV === 'development') {
    return false;
  }

  return !(typeof chrome !== 'undefined' && !!chrome.devtools?.inspectedWindow);
};
