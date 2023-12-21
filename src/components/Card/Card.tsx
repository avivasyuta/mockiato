import { Paper, PaperProps } from '@mantine/core';
import { FC } from 'react';

type CardProps = import('@mantine/utils').PolymorphicComponentProps<'div', PaperProps>

export const Card: FC<CardProps> = ({ children, ...rest }) => {
    return (
        <Paper
            shadow="sm"
            radius="md"
            p="md"
            withBorder
            {...rest}
        >
            {children}
        </Paper>
    );
};
