import React from 'react';

/**
 * Modern Input Component
 */
export const Input = ({ label, error, register, type = 'text', className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`
                    flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400
                    text-slate-900 transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                    disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50
                    ${error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : ''}
                `}
                {...(register || {})}
                {...props}
            />
            {error && (
                <span className="text-xs font-medium text-rose-500 animate-in slide-in-from-top-1">
                    {error.message}
                </span>
            )}
        </div>
    );
};
