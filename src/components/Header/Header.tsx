import React, { FC } from 'react';
import { Box, useMantineTheme } from '@mantine/core';
import styles from './Header.module.css';

export const Header: FC<React.PropsWithChildren> = ({ children }) => {
    const theme = useMantineTheme();

    return (
        <Box
            className={styles.header}
            bg={theme.colorScheme === 'dark' ? theme.colors.dark[7] : '#ffffff'}
            style={{ borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2] }}
        >
            {children}
        </Box>
    );
};
