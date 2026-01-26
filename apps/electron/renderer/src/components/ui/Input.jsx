import React from 'react';
import styles from './Input.module.css';

/**
 * Input Component
 * @param {Object} props
 * @param {string} props.label
 * @param {Object} [props.error]
 * @param {Object} [props.register] - react-hook-form register object
 * @param {string} [props.type='text']
 */
export const Input = ({ label, error, register, type = 'text', ...props }) => {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                type={type}
                className={`${styles.input} ${error ? styles.hasError : ''}`}
                {...(register || {})}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error.message}</span>}
        </div>
    );
};
