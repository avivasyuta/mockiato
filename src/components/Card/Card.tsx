import { forwardRef } from 'react';
import { Paper, PaperProps } from '@mantine/core';
import classes from './Card.module.css';

type CardProps = import('@mantine/utils').PolymorphicComponentProps<'div', PaperProps>;

export const Card = forwardRef<HTMLDivElement, CardProps>(({ children, ...rest }, ref) => {
    return (
        <Paper
            ref={ref}
            shadow="sm"
            radius="md"
            withBorder
            className={classes.card}
            {...rest}
        >
            {children}
        </Paper>
    );
});

Card.displayName = 'Card';
