import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
    // Map specific status words to Tailwind classes
    const getVariantClasses = (v) => {
        const val = String(v).toLowerCase();

        // Success / Active
        if (['aprobado', 'activo', 'conforme', 'validado', 'normal'].some(s => val.includes(s))) {
            return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        }

        // Danger / Error / Inactive
        if (['anulado', 'rechazado', 'inactivo', 'baja', 'critica', 'error', 'sin stock'].some(s => val.includes(s))) {
            return 'bg-rose-100 text-rose-700 border-rose-200';
        }

        // Warning / Caution
        if (['observado', 'stock_bajo', 'alerta', 'pendiente'].some(s => val.includes(s))) {
            return 'bg-amber-100 text-amber-700 border-amber-200';
        }

        // Info / Registered / Blue
        if (['registrado', 'proceso', 'nuevo', 'ingreso', 'azul'].some(s => val.includes(s))) {
            return 'bg-blue-100 text-blue-700 border-blue-200';
        }

        // Default / Grey
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const variantClasses = getVariantClasses(variant || children);

    return (
        <span className={`
            inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
            ${variantClasses}
            ${className}
        `}>
            {children}
        </span>
    );
};
