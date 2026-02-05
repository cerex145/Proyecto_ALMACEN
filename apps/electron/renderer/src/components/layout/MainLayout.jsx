import React from 'react';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50/50">
            <Sidebar />
            <main className="flex-1 ml-[260px] p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};
