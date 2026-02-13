import React from 'react';

export const Table = ({ children, containerClassName = '', tableClassName = '' }) => {
    return (
        <div className={`w-full overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white ${containerClassName}`}>
            <table className={`w-full text-sm text-left text-slate-600 ${tableClassName}`}>
                {children}
            </table>
        </div>
    );
};

export const TableHead = ({ children, className = '' }) => (
    <thead className={`bg-slate-50 text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 ${className}`}>
        {children}
    </thead>
);

export const TableBody = ({ children }) => (
    <tbody className="divide-y divide-slate-100">
        {children}
    </tbody>
);

export const TableRow = ({ children, className = '', ...props }) => (
    <tr className={`hover:bg-slate-50/80 transition-colors duration-150 ${className}`} {...props}>
        {children}
    </tr>
);

export const TableHeader = ({ children, className = '' }) => (
    <th className={`px-6 py-4 tracking-wider ${className}`}>
        {children}
    </th>
);

export const TableCell = ({ children, colSpan, className = '', ...props }) => (
    <td className={`px-6 py-4 whitespace-nowrap ${className}`} colSpan={colSpan} {...props}>
        {children}
    </td>
);
