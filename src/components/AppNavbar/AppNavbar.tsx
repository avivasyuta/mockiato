import React, { useCallback, useContext } from 'react';
import {
    ActionIcon,
    Divider,
    Group,
    Navbar,
    Text,
} from '@mantine/core';
import { IconBrandGithub, IconPlaylistAdd, IconVersions } from '@tabler/icons';
import { MockFormContext } from '../../context/MockFormContext';
import manifest from '../../../public/manifest.json';

export const AppNavbar = () => {
    const dispatch = useContext(MockFormContext);

    const handleOpenMockForm = useCallback(() => {
        dispatch({ type: 'open' });
    }, []);

    return (
        <Navbar p="sm" width={{ base: 300 }}>
            <Navbar.Section>
                <Group position="apart">
                    <Text size="sm">Mockiato</Text>

                    <ActionIcon
                        variant="hover"
                        color="blue"
                        size="sm"
                        radius="sm"
                        title="Add new mock"
                        onClick={handleOpenMockForm}
                    >
                        <IconPlaylistAdd />
                    </ActionIcon>
                </Group>
            </Navbar.Section>

            <Divider my="sm" variant="dotted" />

            <Navbar.Section grow mt="md">
                Menu here
            </Navbar.Section>

            <Divider my="sm" variant="dotted" />

            <Navbar.Section>
                <Group position="left">
                    <IconVersions size={16} color="gray" />
                    <Text size="xs" color="gray">
                        v
                        {manifest.version}
                    </Text>
                </Group>

                <Group position="left" mt="xs">
                    <IconBrandGithub size={16} color="gray" />
                    <Text
                        size="xs"
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/avivasyuta/mockiato"
                        color="gray"
                    >
                        View source code
                    </Text>
                </Group>
            </Navbar.Section>
        </Navbar>
    );
};
