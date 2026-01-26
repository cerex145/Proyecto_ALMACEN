import React from 'react';

const KardexLayout = () => {
    // Dummy fields to match the screenshot
    const data = Array.from({ length: 30 }).map((_, i) => ({
        id: i + 1,
        producto: 'FORCEPS HARTMANN x 1 unidad',
        lote: `SM0612-0623${i < 10 ? '0' + i : i}`,
        cod: `SM 12-${362 + i}`,
        ruc: '20608436018',
        ingreso: 12 + i,
        salida: 12 + i,
        stock: i === 3 ? 26 : 0, // Just one with stock to match example
        dia: 24
    }));

    return (
        <div className="min-h-screen bg-white font-sans text-xs">
            {/* Header */}
            <div className="bg-yellow-300 text-black text-center py-1 font-bold text-lg mb-4 border-b-2 border-yellow-500 uppercase tracking-widest">
                KARDEX
            </div>

            <div className="max-w-[1400px] mx-auto px-4 overflow-x-auto">
                <table className="w-full border-collapse border-b border-gray-300">
                    <thead>
                        <tr className="bg-[#4472C4] text-white">
                            <th className="p-1 text-left w-12 border-r border-white">N° CAJA</th>
                            <th className="p-1 text-left border-r border-white">Producto</th>
                            <th className="p-1 text-left w-32 border-r border-white">Lote</th>
                            <th className="p-1 text-left w-32 border-r border-white">Cod. Producto</th>
                            <th className="p-1 text-left w-32 border-r border-white">RUC</th>
                            <th className="p-1 text-right w-24 border-r border-white">Total Ingreso</th>
                            <th className="p-1 text-right w-24 border-r border-white">Total Salida</th>
                            <th className="p-1 text-center w-24 border-r border-white">Stock</th>
                            <th className="p-1 text-center w-16">DIA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={row.id} className={`${index % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-yellow-50 border-b border-gray-200 text-blue-900`}>
                                <td className="p-1 border-r border-gray-300"></td>
                                <td className="p-1 border-r border-gray-300 font-medium truncate max-w-xs" title={row.producto}>{row.producto}</td>
                                <td className="p-1 border-r border-gray-300 whitespace-nowrap">{row.lote}</td>
                                <td className="p-1 border-r border-gray-300 whitespace-nowrap">{row.cod}</td>
                                <td className="p-1 border-r border-gray-300 whitespace-nowrap">{row.ruc}</td>
                                <td className="p-1 border-r border-gray-300 text-right">{row.ingreso}</td>
                                <td className="p-1 border-r border-gray-300 text-right">{row.salida}</td>
                                <td className="p-1 border-r border-gray-300 text-center flex justify-between px-2 items-center">
                                    <span className="font-bold">{row.stock}</span>
                                    {row.stock === 0 ? (
                                        <span className="text-red-500 text-[10px]">▼</span>
                                    ) : (
                                        <span className="text-orange-500 text-[10px]">►</span>
                                    )}
                                </td>
                                <td className="p-1 text-center bg-blue-100/50">{row.dia}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KardexLayout;
