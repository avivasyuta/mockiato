import { FC, useContext, useEffect } from 'react';
import {
    Button,
    Drawer,
    Grid,
    Group,
    NumberInput,
    SegmentedControl,
    Select,
    Tabs,
    Textarea,
    TextInput,
    useMantineTheme,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { nanoid } from 'nanoid';
import { HttpMethodType, THeader, TMock } from '../../types';
import { Response } from './components/Response';
import { Headers } from './components/Headers';
import styles from './MockForm.module.css';
import { trimHeaders } from './utils';
import { AppContext } from '../../context/AppContext';

type MockFormProps = {
    mock?: TMock
    isOpen: boolean
}

const initialValues: TMock = {
    id: nanoid(),
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

export const MockForm: FC<MockFormProps> = ({ mock, isOpen }) => {
    const { dispatchMockForm, store, setStore } = useContext(AppContext);
    const theme = useMantineTheme();
    const form = useForm<TMock>({ initialValues });

    useEffect(() => {
        if (mock) {
            form.setValues(mock);
        }
    }, [mock]);

    const handleClose = () => {
        dispatchMockForm({ type: 'close' });
        form.reset();
    };

    const handleChangeResponse = (value: string): void => {
        form.setFieldValue('response', value);
    };

    const handleChangeHeaders = (headers: THeader[]): void => {
        form.setFieldValue('responseHeaders', headers);
    };

    const handleChangeStatus = (value: string): void => {
        if (value === 'enabled') {
            form.setFieldValue('isActive', true);
        } else {
            form.setFieldValue('isActive', false);
        }
    };

    const handleSubmit = async (values: TMock) => {
        const updatedMock = trimHeaders(values);
        const isNew = !store.mocks.find((m) => m.id === updatedMock.id);
        if (isNew) {
            setStore({
                ...store,
                mocks: [...store.mocks, updatedMock],
            });
        } else {
            setStore({
                ...store,
                mocks: store.mocks.map((m) => {
                    if (m.id === updatedMock.id) {
                        return updatedMock;
                    }
                    return m;
                }),
            });
        }

        handleClose();

        showNotification({
            title: 'You deal great',
            message: 'Mock data was saved',
            icon: <IconCheck size={18} />,
            color: 'green',
        });
    };

    return (
        <Drawer
            opened={isOpen}
            padding="sm"
            position="right"
            size="50%"
            onClose={handleClose}
            title={mock?.id ? 'Edit mock' : 'Add new mock'}
            className={styles.drawer}
            overlayColor={theme.colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[1]}
            overlayOpacity={0.2}
            overlayBlur={2}
        >
            <form
                className={styles.form}
                onSubmit={form.onSubmit(handleSubmit)}
            >
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

                <Grid mt="xs">
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
                            label="Delay"
                            min={0}
                            max={maxDelay}
                            size="xs"
                            {...form.getInputProps('delay')}
                        />
                    </Grid.Col>
                </Grid>

                <Tabs
                    mt="lg"
                    defaultValue="response"
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
                        <Tabs.Tab value="response">Response body</Tabs.Tab>
                        <Tabs.Tab value="headers">Response headers</Tabs.Tab>
                        <Tabs.Tab value="comments">Comments</Tabs.Tab>
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
                        onClick={handleClose}
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
        </Drawer>
    );
};
