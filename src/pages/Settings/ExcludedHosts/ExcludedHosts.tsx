import React from 'react';
import { ActionIcon, Button, Group, Text, TextInput } from '@mantine/core';
import { IconPlaylistAdd, IconX } from '@tabler/icons-react';
import { nanoid } from 'nanoid';
import { TExcludedHost } from '~/types';
import styles from './ExcludedHosts.module.css';

type ExcludedHostsProps = {
    hosts: TExcludedHost[];
    onChange: (hosts: TExcludedHost[]) => void;
};

export const ExcludedHosts: React.FC<ExcludedHostsProps> = ({ hosts, onChange }) => {
    const handleDelete = (id: string) => {
        const newHosts = hosts.filter((host) => host.id !== id);
        onChange(newHosts);
    };

    const handleAddHeader = () => {
        onChange([
            ...hosts,
            {
                id: nanoid(),
                type: 'scalar',
                value: '',
            },
        ]);
    };

    const handlleChange = (value: string, id: string) => {
        const newVal = hosts.map((host) => {
            const val = { ...host };
            if (val.id === id) {
                val.value = value;
            }

            return val;
        });
        onChange(newVal);
    };

    return (
        <>
            <Text
                size="sm"
                fw={500}
            >
                Excluded hosts
            </Text>
            <Text
                size="xs"
                c="dimmed"
            >
                The extension script will not be added to the pages of these hosts
            </Text>

            {hosts.map(({ value, id }) => (
                <Group
                    justify="left"
                    gap="xs"
                    mb="xs"
                    mt="sm"
                    key={id}
                    align="flex-start"
                >
                    <TextInput
                        size="xs"
                        title="HTTP header key"
                        value={value}
                        className={styles.input}
                        onChange={(e) => handlleChange(e.target.value, id)}
                    />

                    <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleDelete(id)}
                    >
                        <IconX size={16} />
                    </ActionIcon>
                </Group>
            ))}

            <div>
                <Button
                    size="compact-xs"
                    mt="xs"
                    variant="outline"
                    leftSection={<IconPlaylistAdd size={16} />}
                    onClick={handleAddHeader}
                >
                    Add Host
                </Button>
            </div>
        </>
    );
};
