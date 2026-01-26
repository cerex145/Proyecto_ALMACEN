import React from 'react';
import styles from './Table.module.css';

export const Table = ({ children }) => {
    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                {children}
            </table>
        </div>
    );
};

export const TableHead = ({ children }) => <thead className={styles.thead}>{children}</thead>;
export const TableBody = ({ children }) => <tbody className={styles.tbody}>{children}</tbody>;
export const TableRow = ({ children }) => <tr className={styles.tr}>{children}</tr>;
export const TableHeader = ({ children }) => <th className={styles.th}>{children}</th>;
export const TableCell = ({ children }) => <td className={styles.td}>{children}</td>;
