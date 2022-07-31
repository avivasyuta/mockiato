import { FC, useEffect } from 'react';
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
import { db } from '../../database';
import { HttpMethod, THeader, TMock } from '../../types';
import { Response } from './components/Response';
import { Headers } from './components/Headers';
import styles from './MockForm.module.css';
import { trimHeaders } from './utils';

type MockFormProps = {
    mock?: TMock
    isOpen: boolean
    onClose: () => void
}

const initialValues: TMock = {
    url: '',
    httpMethod: HttpMethod.GET,
    httpStatusCode: 200,
    delay: 0,
    responseType: 'json',
    responseHeaders: [],
    isActive: true,
};

const maxDelay = 999999;
const httpMethods = Object.values(HttpMethod);

export const MockForm: FC<MockFormProps> = ({ mock, isOpen, onClose }) => {
    const theme = useMantineTheme();

    const form = useForm<TMock>({ initialValues });

    useEffect(() => {
        if (mock) {
            form.setValues(mock);
        }
    }, [mock]);

    const handleClose = () => {
        onClose();
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
        if (updatedMock?.id) {
            await db.mocks.update(updatedMock.id, updatedMock);
        } else {
            await db.mocks.add(updatedMock);
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
                    className={styles.tabs}
                    styles={() => ({
                        body: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            overflowY: 'auto',
                            borderBottom: `1px solid ${theme.colors.gray[4]}`,
                        },
                    })}
                >
                    <Tabs.Tab label="Response body">
                        <Response
                            form={form}
                            onChange={handleChangeResponse}
                        />
                    </Tabs.Tab>

                    <Tabs.Tab label="Response headers">
                        <Headers
                            form={form}
                            onChange={handleChangeHeaders}
                        />
                    </Tabs.Tab>

                    <Tabs.Tab label="Comments">
                        <Textarea
                            size="xs"
                            autosize
                            minRows={5}
                            {...form.getInputProps('comment')}
                        />
                    </Tabs.Tab>
                </Tabs>

                <Group position="right" mt="md">
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
