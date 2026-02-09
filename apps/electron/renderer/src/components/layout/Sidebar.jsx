import React from 'react';
import { NavLink } from 'react-router-dom';

const MenuLink = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium text-sm group ${isActive
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 translate-x-1'
                : 'text-slate-500 hover:bg-white/60 hover:text-blue-600 hover:translate-x-1'
            }`
        }
    >
        <span className="shrink-0">{icon}</span>
        <span className="tracking-wide">{label}</span>
    </NavLink>
);

// SVGs for Icons (Optimized)
const HomeIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>);
const BoxIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>);
const UsersIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>);
const HistoryIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" /><path d="M12 7v5l4 2" /></svg>);
const ArrowDownIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>);
const ArrowUpIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>);
const FileTextIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>);
const SettingsIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>);

export const Sidebar = () => {
    return (
        <aside className="w-[270px] fixed left-0 top-0 bottom-0 z-50 glass-panel flex flex-col p-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4 mb-12 px-2">
                <div className="relative group">
                    <div className="absolute inset-0 bg-blue-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white shadow-xl">
                        <BoxIcon />
                    </div>
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-800 font-display">Almacén</h1>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-xs text-slate-500 font-medium tracking-wide">BPA System v1.0</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-2">Principal</div>
                <MenuLink to="/" icon={<HomeIcon />} label="Dashboard" />
                <MenuLink to="/productos" icon={<BoxIcon />} label="Inventario" />
                <MenuLink to="/clientes/registro" icon={<UsersIcon />} label="Clientes" />

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-8">Operaciones</div>
                <MenuLink to="/ingresos/nuevo" icon={<ArrowDownIcon />} label="Nota de ingreso" />
                <MenuLink to="/ingresos/historial" icon={<HistoryIcon />} label="Historial de ingresos" />
                <MenuLink to="/recepcion/acta" icon={<FileTextIcon />} label="Actas Recepción" />
                <MenuLink to="/salidas/nuevo" icon={<ArrowUpIcon />} label="Nota de salida" />
                <MenuLink to="/reportes" icon={<FileTextIcon />} label="Reportes" />

                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-4 mt-8">Auditoría</div>
                <MenuLink to="/kardex" icon={<HistoryIcon />} label="Kardex" />
                <MenuLink to="/ajustes" icon={<SettingsIcon />} label="Ajustes" />
            </nav>

            {/* Profile */}
            <div className="mt-8 pt-6 border-t border-slate-200/60">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100/50 hover:bg-white transition-colors cursor-pointer group">
                    <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors">
                        AD
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">Administrador</p>
                        <p className="text-[11px] text-slate-400">admin@cerex.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
