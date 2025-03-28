import { FC, useMemo } from 'react';
import {
    Button,
    Divider,
    Grid,
    Group,
    NumberInput,
    SegmentedControl,
    Select,
    Tabs,
    Text,
    Textarea,
    TextInput,
} from '@mantine/core';
import { nanoid } from 'nanoid';
import { isNotEmpty } from '@mantine/form';
import { HttpMethodType, TMock } from '~/types';
import { useStore } from '~/hooks/useStore';
import { Response } from './components/Response';
import { Headers } from './components/Headers';
import { MockFormProvider, useMockForm } from './context';
import styles from './MockForm.module.css';

type MockFormProps = {
    mock?: TMock;
    onClose: () => void;
    onSubmit: (mock: TMock) => void;
};

const initialValues: TMock = {
    id: '',
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
const headerKeyRegexp = /^[a-zA-Z0-9_-]+$/;
const headerKeyError = 'Only latin letters, numbers and symbols "-" and "_" are available';

export const MockForm: FC<MockFormProps> = ({ mock, onClose, onSubmit }) => {
    const [groups] = useStore('mockGroups');

    const form = useMockForm({
        initialValues: mock ?? {
            ...initialValues,
            id: nanoid(),
        },
        validate: {
            url: isNotEmpty('Enter URL'),
            responseHeaders: {
                key: (value) => (!value.match(headerKeyRegexp) ? headerKeyError : null),
            },
        },
    });

    const handleChangeStatus = (value: string): void => {
        if (value === 'enabled') {
            form.setFieldValue('isActive', true);
        } else {
            form.setFieldValue('isActive', false);
        }
    };

    const groupsOptions = useMemo(() => {
        return (groups ?? []).map((g) => ({
            value: g.id,
            label: g.name,
        }));
    }, [groups]);

    return (
        <MockFormProvider form={form}>
            <form
                className={styles.form}
                onSubmit={form.onSubmit(onSubmit)}
            >
                <Group justify="space-between">
                    <Text>{mock?.id ? 'Edit mock' : 'Add new mock'}</Text>

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
                            size="xs"
                        >
                            Save
                        </Button>
                    </Group>
                </Group>

                <Divider mb="xs" />

                <Grid align="flex-start">
                    <Grid.Col span={8}>
                        <TextInput
                            label="Url"
                            size="xs"
                            {...form.getInputProps('url')}
                        />
                    </Grid.Col>

                    <Grid.Col span={4}>
                        <Text
                            size="xs"
                            mb="0.3rem"
                        >
                            Status
                        </Text>
                        <SegmentedControl
                            size="xs"
                            fullWidth
                            color={form.values.isActive ? 'blue' : 'gray'}
                            value={form.values.isActive ? 'enabled' : 'disabled'}
                            data={[
                                {
                                    label: 'Enabled',
                                    value: 'enabled',
                                },
                                {
                                    label: 'Disabled',
                                    value: 'disabled',
                                },
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

                <Select
                    label="Group"
                    size="xs"
                    data={groupsOptions}
                    searchable
                    disabled={groups?.length === 0}
                    {...form.getInputProps('groupId')}
                />

                <Tabs
                    mt="xs"
                    variant="outline"
                    className={styles.tabs}
                    defaultValue="response"
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
                        <Tabs.Tab
                            value="response"
                            className={styles.tab}
                        >
                            Response Body
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="headers"
                            className={styles.tab}
                        >
                            Response Headers
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="comments"
                            className={styles.tab}
                        >
                            Comments
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel
                        value="response"
                        pt="xs"
                    >
                        <Response />
                    </Tabs.Panel>

                    <Tabs.Panel
                        value="headers"
                        pt="xs"
                    >
                        <Headers />
                    </Tabs.Panel>

                    <Tabs.Panel
                        value="comments"
                        pt="xs"
                    >
                        <Textarea
                            size="xs"
                            autosize
                            minRows={5}
                            {...form.getInputProps('comment')}
                        />
                    </Tabs.Panel>
                </Tabs>
            </form>
        </MockFormProvider>
    );
};
