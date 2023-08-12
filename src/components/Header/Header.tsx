import React, { FC } from 'react';
import styles from './Header.module.css';

export const Header: FC<React.PropsWithChildren> = ({ children }) => (
    <div className={styles.header}>
        {children}
    </div>
);
