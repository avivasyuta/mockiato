import { TMockFilters } from '~/pages/Mocks/types';
import { TMock } from '~/types';

export const matchMockFilters = (mock: TMock, filters: TMockFilters): boolean => {
  const search = filters.search.trim().toLowerCase();

  if (search) {
    const haystack = `${mock.name ?? ''} ${mock.url}`.toLowerCase();
    if (!haystack.includes(search)) {
      return false;
    }
  }

  if (filters.httpMethod && mock.httpMethod !== filters.httpMethod) {
    return false;
  }

  if (filters.httpStatusCode && String(mock.httpStatusCode) !== filters.httpStatusCode) {
    return false;
  }

  return true;
};

export const isMockFiltersActive = (filters: TMockFilters): boolean =>
  filters.search.trim() !== '' || filters.httpMethod !== null || filters.httpStatusCode !== null;
