import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { NotFound } from '../NotFound';
import styles from './Logs.module.css';
import { Log } from './Log';

export const Logs: React.FC = () => {
    const { store } = useContext(AppContext);

    if (!store.logs || store.logs.length === 0) {
        return <NotFound text="There are no logs." />;
    }

    return (
        <div className={styles.logs}>
            {store.logs.map((log) => <Log log={log} />)}
        </div>
    );
};
