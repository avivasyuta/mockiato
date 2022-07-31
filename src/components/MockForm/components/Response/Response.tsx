import { FC } from 'react';
import { Radio, RadioGroup, Textarea } from '@mantine/core';
// eslint-disable-next-line import/no-unresolved
import { UseFormReturnType } from '@mantine/form/lib/use-form';
import { TMock } from '../../../../types';
import { JSONEditor } from '../../../JSONEditor';

type TResponseProps = {
    form: UseFormReturnType<TMock>
    onChange: (value: string) => void
}

export const Response: FC<TResponseProps> = ({ form, onChange }) => (
    <>
        <RadioGroup
            size="sm"
            required
            mb="md"
            {...form.getInputProps('responseType')}
        >
            <Radio value="json" label="JSON" />
            <Radio value="text" label="Text" />
        </RadioGroup>

        {form.values.responseType === 'json' && (
            <JSONEditor
                value={form.getInputProps('response').value}
                onChange={onChange}
                error={form.errors.response as string}
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
