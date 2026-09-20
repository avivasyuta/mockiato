import { FC, useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Grid,
  Group,
  SegmentedControl,
  Select,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';

import { UrlInput, type UrlInputProps } from '~/components/UrlInput';

import { HttpMethodType, THeader } from '../../types';
import styles from './HeaderForm.module.css';

interface HeaderFormProps {
  initialValue: THeader;
  onSubmit: (header: THeader) => void;
  onClose: () => void;
}

const httpMethods = Object.values(HttpMethodType);

export const HeaderForm: FC<HeaderFormProps> = ({ initialValue, onSubmit, onClose }) => {
  const [isUrlEnabled, setIsUrlEnabled] = useState<boolean>(initialValue?.url !== undefined || false);
  const form = useForm<THeader>({
    initialValues: initialValue,
  });

  const handleSpecifyUrl = (): void => {
    setIsUrlEnabled((curr) => {
      const newVal = !curr;

      if (!newVal) {
        form.setFieldValue('url', undefined);
        form.setFieldValue('httpMethod', undefined);
      } else {
        form.setFieldValue('httpMethod', HttpMethodType.GET);
        form.setFieldValue('urlType', form.values.urlType ?? 'url');
      }

      return newVal;
    });
  };

  const handleSubmit = (values: THeader) => {
    onSubmit(values);
    form.reset();
  };

  const handleChangeStatus = (value: string): void => {
    if (value === 'enabled') {
      form.setFieldValue('isActive', true);
    } else {
      form.setFieldValue('isActive', false);
    }
  };

  const handleChangeUrlType: UrlInputProps['onChangeValueType'] = (valueType) => {
    form.setFieldValue('urlType', valueType);
  };

  return (
    <form
      className={styles.form}
      onSubmit={form.onSubmit(handleSubmit)}
    >
      <Group justify="space-between">
        <Text>{initialValue.id ? 'Add new header' : 'Edit header'}</Text>

        <Group
          justify="right"
          gap="xs"
        >
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            data-testid="header-form/cancel"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            size="xs"
            data-testid="header-form/save"
          >
            Save
          </Button>
        </Group>
      </Group>

      <Divider mb="xs" />

      <Alert
        mb="lg"
        icon={<IconAlertCircle size="1rem" />}
      >
        These header will be added to requests.
        <br />
        If such header already exists in requests, it will be overwritten.
      </Alert>

      <div className={styles.inputs}>
        <Grid align="flex-end">
          <Grid.Col span={6}>
            <SegmentedControl
              size="xs"
              fullWidth
              color={form.values.isActive ? 'blue' : 'gray'}
              value={form.values.isActive ? 'enabled' : 'disabled'}
              data={[
                { label: 'Enabled', value: 'enabled' },
                { label: 'Disabled', value: 'disabled' },
              ]}
              data-testid="header-form/status"
              onChange={handleChangeStatus}
            />
          </Grid.Col>
        </Grid>

        <Grid>
          <Grid.Col span={6}>
            <TextInput
              required
              label="Key"
              size="xs"
              data-testid="header-form/key"
              {...form.getInputProps('key')}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              required
              label="Value"
              size="xs"
              data-testid="header-form/value"
              {...form.getInputProps('value')}
            />
          </Grid.Col>
        </Grid>

        <Checkbox
          checked={isUrlEnabled}
          label="Specify URL"
          size="xs"
          mt="xs"
          data-testid="header-form/specify-url"
          onChange={handleSpecifyUrl}
        />

        {isUrlEnabled && (
          <Grid>
            <Grid.Col span={3}>
              <Select
                required
                label="Method"
                data={httpMethods}
                size="xs"
                data-testid="header-form/method"
                {...form.getInputProps('httpMethod')}
              />
            </Grid.Col>

            <Grid.Col span={9}>
              <UrlInput
                valueType={form.values.urlType ?? 'url'}
                onChangeValueType={handleChangeUrlType}
                testIdScope="header-form"
                {...form.getInputProps('url')}
              />
            </Grid.Col>
          </Grid>
        )}
      </div>
    </form>
  );
};
