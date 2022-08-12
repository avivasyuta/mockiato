import { FC } from 'react';
import { Radio, Textarea } from '@mantine/core';
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
            mb="md"
            {...form.getInputProps('responseType')}
        >
            <Radio value="json" label="JSON" />
            <Radio value="text" label="Text" />
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
                minRows={12}
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
