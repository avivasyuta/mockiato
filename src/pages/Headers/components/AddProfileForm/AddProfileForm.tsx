import React, { FC } from 'react';
import { Button, Group, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { nanoid } from 'nanoid';
import { THeadersProfile } from '../../../../types';

type AddProfileFormProps = {
    onSubmit: (profile: THeadersProfile) => void
}

const maxLength = 16;

type Form = Omit<THeadersProfile, 'id'>;

const initialValues: Form = {
    name: '',
    status: 'enabled',
    headers: [],
    lastActive: false,
};

export const AddProfileForm: FC<AddProfileFormProps> = ({ onSubmit }) => {
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
                label="Profile name"
                maxLength={maxLength}
                placeholder="Development"
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
