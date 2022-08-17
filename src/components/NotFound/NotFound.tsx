import React from 'react';
import styles from './NotFound.module.css';

type NotFoundProps = {
    text: string
}

export const NotFound: React.FC<NotFoundProps> = ({ text }) => (
    <div className={styles.container}>{text}</div>
);
