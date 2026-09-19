import { FC } from 'react';
import { ActionIcon, Button, Grid, Group, TextInput } from '@mantine/core';
import { IconPlaylistAdd, IconX } from '@tabler/icons-react';
import { nanoid } from 'nanoid';

import { useMockFormContext } from '../../context';
import styles from './Headers.module.css';

const fieldName = 'responseHeaders';

export const Headers: FC = () => {
  const form = useMockFormContext();

  const handleDelete = (index: number): void => {
    form.removeListItem(fieldName, index);
  };

  const handleAddHeader = () => {
    form.insertListItem(fieldName, {
      key: '',
      value: '',
      id: nanoid(),
    });
  };

  return (
    <>
      {form.values.responseHeaders.map(({ id }, index) => (
        <Group
          justify="left"
          gap="xs"
          mb="xs"
          key={id}
          align="flex-start"
        >
          <Grid
            key={id}
            className={styles.inputs}
          >
            <Grid.Col span={6}>
              <TextInput
                size="xs"
                title="HTTP header key"
                placeholder="Header key"
                data-testid={`mock-form/header-key-${index}`}
                {...form.getInputProps(`${fieldName}.${index}.key`)}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                size="xs"
                placeholder="Header value"
                data-testid={`mock-form/header-value-${index}`}
                {...form.getInputProps(`${fieldName}.${index}.value`)}
              />
            </Grid.Col>
          </Grid>

          <ActionIcon
            color="red"
            variant="subtle"
            data-testid={`mock-form/header-delete-${index}`}
            onClick={() => handleDelete(index)}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      ))}

      <div>
        <Button
          size="xs"
          variant="outline"
          leftSection={<IconPlaylistAdd size={16} />}
          data-testid="mock-form/header-add"
          onClick={handleAddHeader}
        >
          Add header
        </Button>
      </div>
    </>
  );
};
