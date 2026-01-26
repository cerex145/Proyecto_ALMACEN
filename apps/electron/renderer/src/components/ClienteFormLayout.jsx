import React from 'react';

const ClienteFormLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header Bar */}
            <header className="bg-blue-700 text-white shadow-md">
                <div className="container mx-auto px-6 py-4 flex items-center">
                    {/* Icon */}
                    <div className="mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-wide">REGISTRO DE CLIENTES</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow p-6 flex justify-center items-start">
                <div className="w-full max-w-6xl bg-white rounded-lg shadow-lg p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Column 1: Identificación y Contacto Principal */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">RUC Cliente</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2" placeholder="Ingrese RUC" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contacto Principal</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                        </div>

                        {/* Column 2: Ubicación */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                                    <option value="">Seleccione Departamento</option>
                                    <option value="lima">Lima</option>
                                    <option value="cajamarca">Cajamarca</option>
                                    <option value="arequipa">Arequipa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                                    <option value="">Seleccione Provincia</option>
                                    <option value="cajamarca">Cajamarca</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Distrito</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                        </div>

                        {/* Column 3: Detalles y Estado */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                <input type="text" className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de Riesgo</label>
                                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                                    <option value="bajo">Riesgo Bajo</option>
                                    <option value="medio">Riesgo Medio</option>
                                    <option value="alto">Riesgo Alto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 bg-white">
                                    <option value="activo">Activo</option>
                                    <option value="inactivo">Inactivo</option>
                                    <option value="suspendido">Suspendido</option>
                                </select>
                            </div>
                        </div>

                    </div>

                    {/* Actions Footer */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end space-x-4">
                        <button className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                            Cancelar
                        </button>
                        <button className="px-6 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm cursor-pointer">
                            Guardar Cliente
                        </button>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ClienteFormLayout;
