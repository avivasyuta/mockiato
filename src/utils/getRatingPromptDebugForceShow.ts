import { logError } from './logger';

const DEBUG_FORCE_SHOW_KEY = 'ratingPrompt.debugForceShow';

const isDevelopment = import.meta.env.VITE_NODE_ENV === 'development';

// Local-only escape hatch for testing the prompt without meeting its real eligibility
// conditions, e.g. `localStorage.setItem('ratingPrompt.debugForceShow', 'true')` in the
// browser console. Deliberately kept outside the main store: it's a dev override, not data.
export const getRatingPromptDebugForceShow = async (): Promise<boolean> => {
  try {
    if (isDevelopment) {
      return localStorage.getItem(DEBUG_FORCE_SHOW_KEY) === 'true';
    }

    const response = await chrome.storage.local.get(DEBUG_FORCE_SHOW_KEY);
    return Boolean(response[DEBUG_FORCE_SHOW_KEY]);
  } catch (err) {
    logError(err);
    return false;
  }
};
