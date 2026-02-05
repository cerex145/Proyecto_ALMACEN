import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-white rounded-2xl border border-slate-100 shadow-card p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-6 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-lg font-bold text-slate-800 tracking-tight ${className}`}>
        {children}
    </h3>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);
