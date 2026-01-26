import React from 'react';
import styles from './Badge.module.css';

/**
 * Badge Component
 * @param {Object} props
 * @param {string} props.children - Status text usually
 * @param {'registrado' | 'aprobado' | 'anulado' | 'pendiente' | 'activo' | 'inactivo'} [props.variant='default'] - Can act as variant
 */
export const Badge = ({ children, variant = 'default' }) => {
    // Map specific status words to CSS classes if needed, or just use the variant as class
    const getVariantClass = (v) => {
        switch (String(v).toLowerCase()) {
            case 'aprobado':
            case 'activo':
            case 'conforme':
                return styles.success;
            case 'registrado':
            case 'pendiente':
                return styles.info;
            case 'anulado':
            case 'rechazado':
            case 'inactivo':
            case 'baja':
                return styles.danger;
            case 'observado':
            case 'stock_bajo':
                return styles.warning;
            default:
                return styles.secondary;
        }
    };

    return (
        <span className={`${styles.badge} ${getVariantClass(variant || children)}`}>
            {children}
        </span>
    );
};
