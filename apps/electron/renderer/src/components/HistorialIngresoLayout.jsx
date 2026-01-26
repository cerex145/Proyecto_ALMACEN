import React from 'react';

const HistorialIngresoLayout = () => {
    // Dummy data to mimic the Excel screenshot
    const data = Array.from({ length: 20 }).map((_, i) => ({
        id: i + 1,
        cod: `SM 12-${362 + i}`,
        producto: 'FORCEPS HARTMANN x 1 unidad',
        lote: `SM0612-0623${i < 10 ? '0' + i : i}`,
        vcto: 'N/A',
        um: 'UND',
        fabri: 'SUNMED INSTRUMENTS',
        temp: '15° 25° C',
        bulto: '1.00',
        cajas: '1.00',
        xCaja: '12.00',
        fraccion: '0.00',
        total: '12.00',
        fecha: '24/06/2025'
    }));

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-xs">
            {/* Header */}
            <div className="bg-fuchsia-600 text-white text-center py-2 font-bold text-lg flex justify-between px-4 items-center shadow-md">
                <div className="flex-1">Formulario de registro de Nota de Ingresos</div>
                <div className="bg-blue-200 p-2 rounded cursor-pointer hover:bg-blue-300 transition-colors">
                    {/* Trash Icon mimicking the one in image */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-800">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse border border-black bg-white text-[11px] shadow-sm">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="border border-white p-1 whitespace-nowrap">Ítem</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cod. Producto</th>
                            <th className="border border-white p-1 whitespace-nowrap">Producto</th>
                            <th className="border border-white p-1 whitespace-nowrap">Lote</th>
                            <th className="border border-white p-1 whitespace-nowrap">Fecha Vcto</th>
                            <th className="border border-white p-1 whitespace-nowrap">UM</th>
                            <th className="border border-white p-1 whitespace-nowrap">Fabri.</th>
                            <th className="border border-white p-1 whitespace-nowrap">Temp.</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cant.Bulto</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cant.Cajas</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cant.x Caja</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cant.Fracción</th>
                            <th className="border border-white p-1 whitespace-nowrap">Cant. Total_Ingreso</th>
                            <th className="border border-white p-1 whitespace-nowrap md:min-w-[100px]">Fecha de H_In</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50`}>
                                <td className="border border-black p-1 text-center">{row.id}</td>
                                <td className="border border-black p-1 text-center">{row.cod}</td>
                                <td className="border border-black p-1 text-center">{row.producto}</td>
                                <td className="border border-black p-1 text-center">{row.lote}</td>
                                <td className="border border-black p-1 text-center">{row.vcto}</td>
                                <td className="border border-black p-1 text-center">{row.um}</td>
                                <td className="border border-black p-1 text-center">{row.fabri}</td>
                                <td className="border border-black p-1 text-center">{row.temp}</td>
                                <td className="border border-black p-1 text-center">{row.bulto}</td>
                                <td className="border border-black p-1 text-center">{row.cajas}</td>
                                <td className="border border-black p-1 text-center">{row.xCaja}</td>
                                <td className="border border-black p-1 text-center">{row.fraccion}</td>
                                <td className="border border-black p-1 text-center">{row.total}</td>
                                <td className="border border-black p-1 text-center">{row.fecha}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination/Status Footer Fake */}
            <div className="px-4 py-2 text-gray-500 text-xs flex justify-between">
                <div>Mostrando 1 a {data.length} de {data.length} registros</div>
            </div>
        </div>
    );
};

export default HistorialIngresoLayout;
