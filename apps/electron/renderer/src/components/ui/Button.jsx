import React from 'react';
import styles from './Button.module.css';

/**
 * Button Component
 * @param {Object} props
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary']
 * @param {boolean} [props.isLoading=false]
 * @param {Function} [props.onClick]
 * @param {React.ReactNode} props.children
 * @param {string} [props.type='button']
 */
export const Button = ({
    variant = 'primary',
    isLoading = false,
    onClick,
    children,
    type = 'button',
    className = '',
    ...props
}) => {
    return (
        <button
            type={type}
            className={`${styles.btn} ${styles[variant]} ${className}`}
            onClick={onClick}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? <span className={styles.loader}></span> : children}
        </button>
    );
};
