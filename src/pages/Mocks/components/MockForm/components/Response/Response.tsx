import { FC } from 'react';
import { Group, Radio, Textarea } from '@mantine/core';
import { JSONEditor } from '~/components/JSONEditor';
import { useMockFormContext } from '../../context';

export const Response: FC = () => {
    const form = useMockFormContext();

    const handleChangeResponse = (value: string): void => {
        form.setFieldValue('response', value);
    };

    return (
        <>
            <Radio.Group
                size="sm"
                required
                mb="sm"
                {...form.getInputProps('responseType')}
            >
                <Group>
                    <Radio
                        value="json"
                        label="JSON"
                        size="xs"
                    />
                    <Radio
                        value="text"
                        label="Text"
                        size="xs"
                    />
                </Group>
            </Radio.Group>

            {form.values.responseType === 'json' && (
                <JSONEditor
                    value={form.getInputProps('response').value}
                    onChange={handleChangeResponse}
                />
            )}

            {form.values.responseType === 'text' && (
                <Textarea
                    size="xs"
                    styles={() => ({
                        root: {
                            flex: 1,
                        },
                        wrapper: {
                            height: '100%',
                        },
                        input: {
                            height: '100%',
                        },
                    })}
                    {...form.getInputProps('response')}
                />
            )}
        </>
    );
};
