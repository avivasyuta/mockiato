import { forwardRef } from 'react';
import { Paper, PaperProps } from '@mantine/core';

type CardProps = import('@mantine/utils').PolymorphicComponentProps<'div', PaperProps>

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, ...rest }, ref) => {
    return (
        <Paper
            ref={ref}
            shadow="sm"
            radius="md"
            p="md"
            withBorder
            {...rest}
        >
            {children}
        </Paper>
    );
});
