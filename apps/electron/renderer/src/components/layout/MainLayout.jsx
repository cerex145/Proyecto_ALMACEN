import React from 'react';
import { Sidebar } from './Sidebar';

export const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

            <Sidebar />

            <main className="flex-1 ml-[270px] p-8 md:p-10 transition-all duration-300 relative z-10">
                <div className="max-w-7xl mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};
