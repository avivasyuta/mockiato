import React, { useCallback, useContext } from 'react';
import { ActionIcon, Box, Divider, Group, Navbar, Text, useMantineTheme } from '@mantine/core';
import { MockFormContext } from '../../context/MockFormContext';
import manifest from '../../../public/manifest.json';
import { IconBrandGithub, IconPlaylistAdd, IconVersions } from '@tabler/icons';

export const AppNavbar = () => {
    const theme = useMantineTheme()
    const dispatch = useContext(MockFormContext);

    const handleOpenMockForm = useCallback(() => {
        dispatch({ type: 'open' })
    }, [])

    return (
        <Navbar p="sm" width={{ base: 300 }}>
            <Navbar.Section>
                <Group position='apart'>
                    <Text size="sm">Mockiato</Text>

                    <ActionIcon
                        variant="hover"
                        color="blue"
                        size="sm"
                        radius="sm"
                        title="Add new mock"
                        onClick={handleOpenMockForm}>
                        <IconPlaylistAdd />
                    </ActionIcon>
                </Group>
            </Navbar.Section>

            <Divider my="sm" variant="dotted"/>

            <Navbar.Section grow mt="md">
                Menu here
            </Navbar.Section>

            <Divider my="sm" variant="dotted"/>

            <Navbar.Section>
                <Group position='left'>
                    <IconVersions size={16} color='gray' />
                    <Text size='xs' color='gray'>
                        v{manifest.version}
                    </Text>
                </Group>

                <Group position='left' mt='xs'>
                    <IconBrandGithub size={16} color='gray' />
                    <Text
                        size='xs'
                        variant="link"
                        component="a"
                        target="_blank"
                        href="https://github.com/avivasyuta/mockiato"
                        color='gray'
                    >
                        View source code
                    </Text>
                </Group>
            </Navbar.Section>
        </Navbar>
    )
}
