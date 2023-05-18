import { Paper, PaperProps, useMantineTheme } from '@mantine/core';
import { FC } from 'react';

type CardProps = import('@mantine/utils').PolymorphicComponentProps<'div', PaperProps>

export const Card: FC<CardProps> = ({ children, ...rest }) => {
    const theme = useMantineTheme();

    return (
        <Paper
            bg={theme.colorScheme === 'dark' ? theme.colors.dark[6] : '#ffffff'}
            shadow="sm"
            radius="md"
            p="0.2rem 0.6rem"
            {...rest}
        >
            {children}
        </Paper>
    );
};
