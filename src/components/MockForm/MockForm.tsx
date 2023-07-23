import { FC } from 'react';
import {
    Button,
    Grid,
    Group,
    NumberInput,
    SegmentedControl,
    Select,
    Tabs,
    Textarea,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { nanoid } from 'nanoid';
import { HttpMethodType, TMockHeader, TMock } from '../../types';
import { Response } from './components/Response';
import { Headers } from './components/Headers';
import styles from './MockForm.module.css';

type MockFormProps = {
    mock?: TMock
    onClose: () => void
    onSubmit: (mock: TMock) => void
}

const initialValues: Omit<TMock, 'id'> = {
    url: '',
    httpMethod: HttpMethodType.GET,
    httpStatusCode: 200,
    delay: 0,
    responseType: 'json',
    responseHeaders: [],
    isActive: true,
};

const maxDelay = 999999;
const httpMethods = Object.values(HttpMethodType);

export const MockForm: FC<MockFormProps> = ({ mock, onClose, onSubmit }) => {
    const form = useForm<TMock>({
        initialValues: mock ?? { ...initialValues, id: nanoid() },
    });

    const handleChangeResponse = (value: string): void => {
        form.setFieldValue('response', value);
    };

    const handleChangeHeaders = (headers: TMockHeader[]): void => {
        form.setFieldValue('responseHeaders', headers);
    };

    const handleChangeStatus = (value: string): void => {
        if (value === 'enabled') {
            form.setFieldValue('isActive', true);
        } else {
            form.setFieldValue('isActive', false);
        }
    };

    return (
        <form className={styles.form} onSubmit={form.onSubmit(onSubmit)}>
            <Grid align="flex-end">
                <Grid.Col span={8}>
                    <TextInput
                        required
                        label="Url"
                        size="xs"
                        {...form.getInputProps('url')}
                    />
                </Grid.Col>
                <Grid.Col span={4}>
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
                <Grid.Col span={4}>
                    <Select
                        required
                        label="Request method"
                        data={httpMethods}
                        size="xs"
                        {...form.getInputProps('httpMethod')}
                    />
                </Grid.Col>

                <Grid.Col span={4}>
                    <NumberInput
                        required
                        label="Response status code"
                        min={100}
                        max={599}
                        size="xs"
                        {...form.getInputProps('httpStatusCode')}
                    />
                </Grid.Col>

                <Grid.Col span={4}>
                    <NumberInput
                        label="Delay, ms"
                        min={0}
                        max={maxDelay}
                        size="xs"
                        {...form.getInputProps('delay')}
                    />
                </Grid.Col>
            </Grid>

            <Tabs
                mt="xs"
                defaultValue="response"
                variant="outline"
                className={styles.tabs}
                styles={() => ({
                    panel: {
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                    },
                })}
            >
                <Tabs.List>
                    <Tabs.Tab value="response" className={styles.tab}>Response body</Tabs.Tab>
                    <Tabs.Tab value="headers" className={styles.tab}>Response headers</Tabs.Tab>
                    <Tabs.Tab value="comments" className={styles.tab}>Comments</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="response" pt="xs">
                    <Response
                        form={form}
                        onChange={handleChangeResponse}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="headers" pt="xs">
                    <Headers
                        form={form}
                        onChange={handleChangeHeaders}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="comments" pt="xs">
                    <Textarea
                        size="xs"
                        autosize
                        minRows={5}
                        {...form.getInputProps('comment')}
                    />
                </Tabs.Panel>
            </Tabs>

            <Group position="right" mt="md" spacing="xs">
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
                    size="xs"
                >
                    Save
                </Button>
            </Group>
        </form>
    );
};
