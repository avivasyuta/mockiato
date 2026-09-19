import { ChangeEventHandler, FC } from 'react';
import { Checkbox, Stack, TextInput, Tooltip } from '@mantine/core';
import { IconRegex } from '@tabler/icons-react';

import { type UrlType } from '~/types';

export type UrlInputProps = {
  valueType: UrlType;
  value?: string;
  onChange?: ChangeEventHandler;
  onChangeValueType: (value: UrlType) => void;
  /** Parent-supplied scope (e.g. "mock-form") prefixed onto this component's own testids. */
  testIdScope?: string;
};

export const UrlInput: FC<UrlInputProps> = ({ value, valueType, onChange, onChangeValueType, testIdScope }) => {
  const handleChangeValueType = () => {
    onChangeValueType(valueType === 'url' ? 'regexp' : 'url');
  };

  const getTestId = (name: string): string => (testIdScope ? `${testIdScope}/url-input/${name}` : `url-input/${name}`);

  return (
    <Stack gap="xs">
      <TextInput
        label="URL"
        size="xs"
        value={value}
        data-testid={getTestId('value')}
        rightSection={
          valueType === 'regexp' ? (
            <Tooltip
              label="RegExp enabled"
              position="bottom"
              transitionProps={{ transition: 'scale' }}
              openDelay={150}
              withArrow
            >
              <IconRegex
                size={18}
                color="#9775fa"
              />
            </Tooltip>
          ) : undefined
        }
        required
        onChange={onChange}
      />

      <Checkbox
        checked={valueType === 'regexp'}
        label="Use as regular expression"
        size="xs"
        data-testid={getTestId('regexp-checkbox')}
        onChange={handleChangeValueType}
      />
    </Stack>
  );
};
