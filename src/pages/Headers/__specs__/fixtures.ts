import { nanoid } from 'nanoid';

import { THeader, THeadersProfile } from '~/types';

export const buildProfile = (
  name: string,
  overrides: Partial<Omit<THeadersProfile, 'name'>> = {},
): THeadersProfile => ({
  id: nanoid(),
  name,
  status: 'enabled',
  lastActive: false,
  headers: [],
  ...overrides,
});

export const buildHeader = (key: string, overrides: Partial<Omit<THeader, 'key'>> = {}): THeader => ({
  id: nanoid(),
  key,
  value: 'value',
  type: 'request',
  isActive: true,
  ...overrides,
});

/** `headersProfiles` in the store is a map keyed by profile id, not an array. */
export const profilesMap = (...profiles: THeadersProfile[]): Record<string, THeadersProfile> =>
  Object.fromEntries(profiles.map((profile) => [profile.id, profile]));
