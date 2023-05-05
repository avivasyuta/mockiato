import React from 'react';
import { Loader } from '@mantine/core';
import styles from './Spinner.module.css';

export const Spinner = () => (
    <div className={styles.spinner}>
        <Loader variant="bars" size="sm" />
    </div>
);
