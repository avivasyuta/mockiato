import { FC } from 'react';
import { Group, Radio, Textarea } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { TMock } from '../../../../types';
import { JSONEditor } from '../../../JSONEditor';

type TResponseProps = {
    form: UseFormReturnType<TMock>
    onChange: (value: string) => void
}

export const Response: FC<TResponseProps> = ({ form, onChange }) => (
    <>
        <Radio.Group
            size="sm"
            required
            mb="sm"
            {...form.getInputProps('responseType')}
        >
            <Group>
                <Radio value="json" label="JSON" size="xs" />
                <Radio value="text" label="Text" size="xs" />
            </Group>
        </Radio.Group>

        {form.values.responseType === 'json' && (
            <JSONEditor
                value={form.getInputProps('response').value}
                onChange={onChange}
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
