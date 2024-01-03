import React, { FC } from 'react';
import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { nanoid } from 'nanoid';
import { TMockGroup } from '../../../../types';

type AddGroupFormProps = {
    onSubmit: (group: TMockGroup) => void
}

const maxLength = 64;

type Form = Omit<TMockGroup, 'id'>;

const initialValues: Form = {
    name: '',
};

export const AddGroupForm: FC<AddGroupFormProps> = ({ onSubmit }) => {
    const form = useForm<Form>({
        initialValues,
    });

    const handleSubmit = (values: Form) => {
        onSubmit({
            id: nanoid(),
            ...values,
        });
        form.reset();
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
                data-autofocus
                label="Group name"
                maxLength={maxLength}
                placeholder="Mocks for testing authentication"
                description={`Maximum ${maxLength} symbols`}
                required
                size="xs"
                {...form.getInputProps('name')}
            />

            <Group justify="right" mt="md">
                <Button type="submit" size="xs">Submit</Button>
            </Group>
        </form>
    );
};
