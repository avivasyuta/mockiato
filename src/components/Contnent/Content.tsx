import React, { FC } from 'react';
import styles from './Content.module.css';

export const Content: FC<React.PropsWithChildren> = ({ children }) => (
    <div className={styles.content}>
        {children}
    </div>
);
