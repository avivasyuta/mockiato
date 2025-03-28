import React, { FC, useState } from 'react';
import { useForm } from '@mantine/form';
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
import { IconAlertCircle } from '@tabler/icons-react';
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
                        onClick={onClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        size="compact-sm"
                        classNames={styles}
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
                            {...form.getInputProps('key')}
                        />
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <TextInput
                            required
                            label="Value"
                            size="xs"
                            {...form.getInputProps('value')}
                        />
                    </Grid.Col>
                </Grid>

                <Checkbox
                    checked={isUrlEnabled}
                    label="Specify URL"
                    size="xs"
                    mt="xs"
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
                                {...form.getInputProps('httpMethod')}
                            />
                        </Grid.Col>

                        <Grid.Col span={9}>
                            <TextInput
                                required
                                label="URL"
                                size="xs"
                                {...form.getInputProps('url')}
                            />
                        </Grid.Col>
                    </Grid>
                )}
            </div>
        </form>
    );
};
