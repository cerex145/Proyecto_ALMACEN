import React from 'react';

const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
    outline: 'bg-transparent border-2 border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600'
};

const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
};

export const Button = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    onClick,
    children,
    type = 'button',
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            type={type}
            className={`
              inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
              ${variants[variant] || variants.primary}
              ${sizes[size] || sizes.md}
              ${className}
            `}
            onClick={onClick}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                </>
            ) : children}
        </button>
    );
};
