import { FC, useMemo } from 'react';
import { Group, Input, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

import { TMockFilters } from '~/pages/Mocks/types';
import { TMock } from '~/types';

type MockFiltersProps = {
  mocks: TMock[];
  filters: TMockFilters;
  onChange: (filters: TMockFilters) => void;
};

export const MockFilters: FC<MockFiltersProps> = ({ mocks, filters, onChange }) => {
  const methodOptions = useMemo(() => Array.from(new Set(mocks.map((mock) => mock.httpMethod))).sort(), [mocks]);

  const statusCodeOptions = useMemo(
    () =>
      Array.from(new Set(mocks.map((mock) => mock.httpStatusCode)))
        .sort((a, b) => a - b)
        .map((code) => String(code)),
    [mocks],
  );

  return (
    <Group
      gap="xs"
      wrap="nowrap"
    >
      <TextInput
        size="xs"
        flex={1}
        w={500}
        placeholder="Filter by name or URL"
        leftSection={<IconSearch size={14} />}
        rightSection={
          filters.search ? (
            <Input.ClearButton
              aria-label="Clear input"
              onClick={() => onChange({ ...filters, search: '' })}
            />
          ) : null
        }
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.currentTarget.value })}
      />

      <Select
        size="xs"
        w={130}
        clearable
        placeholder="Method"
        data={methodOptions}
        value={filters.httpMethod}
        onChange={(value) => onChange({ ...filters, httpMethod: value as TMockFilters['httpMethod'] })}
      />

      <Select
        size="xs"
        w={130}
        clearable
        placeholder="Status code"
        data={statusCodeOptions}
        value={filters.httpStatusCode}
        onChange={(value) => onChange({ ...filters, httpStatusCode: value })}
      />
    </Group>
  );
};
