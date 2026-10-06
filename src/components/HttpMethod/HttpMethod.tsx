import React from 'react';
import { Text, useMantineTheme } from '@mantine/core';

import { HttpMethodType } from '../../types';

// Colors are grouped by semantics: read, create, update, delete.
// Service and rare methods (HEAD, OPTIONS, LINK, LOCK, ...) fall back to gray.
const colorsMap: { [key in HttpMethodType]?: string } = {
  [HttpMethodType.GET]: 'green',
  [HttpMethodType.POST]: 'orange',
  [HttpMethodType.PUT]: 'blue',
  [HttpMethodType.PATCH]: 'blue',
  [HttpMethodType.DELETE]: 'red',
  [HttpMethodType.PURGE]: 'red',
};

type HttpStatusProps = {
  method: HttpMethodType;
};

export const HttpMethod: React.FC<HttpStatusProps> = ({ method }) => {
  const theme = useMantineTheme();
  const grayColor = theme.colors.gray[5];

  return (
    <Text
      span
      tt="uppercase"
      c={colorsMap[method] ?? grayColor}
      fw={700}
      fz="xs"
      title="HTTP method"
    >
      {method}
    </Text>
  );
};
