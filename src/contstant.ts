export const EXTENSION_NAME = 'Mockiato';
export const INTERCEPTOR_ID = 'mockiato_intercept_script';
export const STORE_KEY = 'mockiato_store';

export const overlaySettings = {
  backgroundOpacity: 0.4,
  blur: 3,
};

export const iconSize = '0.95rem';

export const statusNodeId = 'mockiato-status';

export const enabledAttributeName = 'data-is-enabled';

export const extensionUrl = 'https://chrome.google.com/webstore/detail/mockiato/ilbkkhmnmnehcicempfpekgcpneeekao';

export const newIssueUrl = 'https://github.com/avivasyuta/mockiato/issues/new';

const DAY_MS = 24 * 60 * 60 * 1000;

export const RATING_PROMPT_CONFIG = {
  // Minimum time since install before the prompt can appear at all.
  minDaysSinceInstallMs: 7 * DAY_MS,
  // Minimum number of mocks currently saved.
  minMocksCount: 2,
  // Minimum number of times a mock has actually replaced a response.
  minMockHitsToShow: 5,
  // Cooldown applied after closing (X) or "Report a problem", while under maxDismissCount.
  snoozeCooldownMs: 30 * DAY_MS,
  // Closing (X) or "Report a problem" this many times total stops the prompt for
  // good, same as "Rate".
  maxDismissCount: 2,
} as const;
